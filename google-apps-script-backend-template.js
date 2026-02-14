/**
 * SECURE GOOGLE APPS SCRIPT BACKEND TEMPLATE
 * 
 * This is a template for your Google Apps Script backend with security measures.
 * Copy this code to your Google Apps Script project.
 * 
 * Setup Instructions:
 * 1. Go to script.google.com
 * 2. Create a new project
 * 3. Copy this code
 * 4. Create a Google Sheet to store submissions
 * 5. Update SHEET_ID with your Google Sheet ID
 * 6. Deploy as Web App
 * 7. Set "Execute as: Me" and "Who has access: Anyone"
 * 8. Copy the deployment URL to your frontend config
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  // Replace with your Google Sheet ID
  SHEET_ID: 'YOUR_GOOGLE_SHEET_ID_HERE',
  
  // Sheet names for different forms
  SHEETS: {
    REGISTRATION: 'Registrations',
    CONTACT: 'Contact Messages'
  },
  
  // Rate limiting settings
  RATE_LIMIT: {
    MAX_SUBMISSIONS: 3,
    TIME_WINDOW: 3600 // 1 hour in seconds
  },
  
  // Allowed origins (update with your domain)
  ALLOWED_ORIGINS: [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    // For development/testing only - REMOVE IN PRODUCTION
    '*'
  ],
  
  // Email settings (optional - for notifications)
  NOTIFICATION_EMAIL: 'your-email@example.com'
};

// ============================================
// MAIN HANDLER
// ============================================

function doPost(e) {
  try {
    // Parse parameters
    const params = e.parameter;
    
    // Security checks
    if (!validateRequest(params)) {
      return createErrorResponse('Invalid request');
    }
    
    // Determine form type and process
    if (params.teamName && params.eventName) {
      return handleRegistration(params);
    } else if (params.subject && params.message) {
      return handleContact(params);
    } else {
      return createErrorResponse('Unknown form type');
    }
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createErrorResponse('An error occurred. Please try again.');
  }
}

// ============================================
// SECURITY VALIDATION
// ============================================

function validateRequest(params) {
  // 1. Honeypot check
  if (params.website && params.website !== '') {
    Logger.log('Bot detected - honeypot filled: ' + params.website);
    // Return fake success to fool bots
    return false;
  }
  
  // 2. Timestamp validation (reject old or future submissions)
  const timestamp = parseInt(params.timestamp);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (!timestamp || 
      timestamp < (now - fiveMinutes) || 
      timestamp > (now + 60000)) {
    Logger.log('Invalid timestamp: ' + timestamp);
    return false;
  }
  
  // 3. Rate limiting
  if (!checkRateLimit(params.userAgent)) {
    Logger.log('Rate limit exceeded for: ' + params.userAgent);
    return false;
  }
  
  // 4. Input validation
  if (!validateInputs(params)) {
    Logger.log('Input validation failed');
    return false;
  }
  
  return true;
}

function checkRateLimit(userAgent) {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'ratelimit_' + Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5, 
    userAgent || 'unknown'
  ).toString().substring(0, 20);
  
  const submissions = cache.get(cacheKey);
  const count = parseInt(submissions) || 0;
  
  if (count >= CONFIG.RATE_LIMIT.MAX_SUBMISSIONS) {
    return false;
  }
  
  // Increment counter
  cache.put(cacheKey, count + 1, CONFIG.RATE_LIMIT.TIME_WINDOW);
  return true;
}

function validateInputs(params) {
  // Email validation
  if (params.email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(params.email) || params.email.length > 254) {
      return false;
    }
  }
  
  // Phone validation (Indian format)
  if (params.phone) {
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = params.phone.replace(/\D/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return false;
    }
  }
  
  // Name length validation
  if (params.name && (params.name.length < 2 || params.name.length > 50)) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPattern = /<script|javascript:|onerror=|onclick=|<iframe|eval\(|expression\(/i;
  const allValues = Object.values(params).join(' ');
  if (suspiciousPattern.test(allValues)) {
    Logger.log('Suspicious pattern detected in input');
    return false;
  }
  
  return true;
}

// ============================================
// REGISTRATION HANDLER
// ============================================

function handleRegistration(params) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.REGISTRATION);
    
    // Generate unique Team ID
    const teamId = generateTeamId();
    
    // Prepare row data
    const rowData = [
      new Date(),
      teamId,
      sanitize(params.teamName),
      sanitize(params.eventName),
      params.teamSize,
      sanitize(params.name || params.leaderName),
      sanitize(params.mateName || ''),
      sanitize(params.college || params.soloCollege || params.duoCollege),
      sanitize(params.department || params.soloDepartment || params.duoDepartment),
      params.year || params.soloYear || params.duoYear,
      sanitize(params.phone || params.soloPhone || params.duoPhone),
      sanitize(params.email || params.soloEmail || params.duoEmail),
      'Pending', // Payment status
      params.userAgent ? params.userAgent.substring(0, 200) : 'Unknown'
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email (optional)
    sendRegistrationEmail(params.email || params.soloEmail || params.duoEmail, teamId, params.teamName);
    
    return createSuccessResponse({
      teamId: teamId,
      message: 'Registration successful'
    });
    
  } catch (error) {
    Logger.log('Registration error: ' + error.toString());
    return createErrorResponse('Registration failed. Please try again.');
  }
}

// ============================================
// CONTACT HANDLER
// ============================================

function handleContact(params) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.CONTACT);
    
    // Generate unique Ticket ID
    const ticketId = generateTicketId();
    
    // Prepare row data
    const rowData = [
      new Date(),
      ticketId,
      sanitize(params.name),
      sanitize(params.email),
      sanitize(params.phone),
      sanitize(params.subject),
      sanitize(params.message),
      'New', // Status
      params.userAgent ? params.userAgent.substring(0, 200) : 'Unknown'
    ];
    
    // Append to sheet
    sheet.appendRow(rowData);
    
    // Send confirmation email (optional)
    sendContactConfirmationEmail(params.email, ticketId);
    
    return createSuccessResponse({
      ticketId: ticketId,
      message: 'Message sent successfully'
    });
    
  } catch (error) {
    Logger.log('Contact error: ' + error.toString());
    return createErrorResponse('Failed to send message. Please try again.');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  // Create sheet if it doesn't exist
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Add headers based on sheet type
    if (sheetName === CONFIG.SHEETS.REGISTRATION) {
      sheet.appendRow([
        'Timestamp', 'Team ID', 'Team Name', 'Event', 'Team Size',
        'Leader/Solo Name', 'Mate Name', 'College', 'Department', 'Year',
        'Phone', 'Email', 'Payment Status', 'User Agent'
      ]);
    } else if (sheetName === CONFIG.SHEETS.CONTACT) {
      sheet.appendRow([
        'Timestamp', 'Ticket ID', 'Name', 'Email', 'Phone',
        'Subject', 'Message', 'Status', 'User Agent'
      ]);
    }
  }
  
  return sheet;
}

function sanitize(input) {
  if (!input) return '';
  
  // Remove HTML tags and dangerous characters
  return String(input)
    .trim()
    .replace(/[<>'"&]/g, '')
    .substring(0, 500);
}

function generateTeamId() {
  const prefix = 'NXR';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + timestamp + random;
}

function generateTicketId() {
  const prefix = 'TKT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return prefix + timestamp + random;
}

function createSuccessResponse(data) {
  const response = {
    status: 'success',
    ...data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*'); // Change to specific domain in production
}

function createErrorResponse(message) {
  const response = {
    status: 'error',
    message: message
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*'); // Change to specific domain in production
}

// ============================================
// EMAIL NOTIFICATIONS (OPTIONAL)
// ============================================

function sendRegistrationEmail(email, teamId, teamName) {
  try {
    const subject = 'NEXORA 2K26 - Registration Confirmation';
    const body = `
Dear Participant,

Thank you for registering for NEXORA 2K26!

Your registration details:
- Team Name: ${teamName}
- Team ID: ${teamId}

IMPORTANT: Please complete your payment of ₹120 and add your Team ID (${teamId}) in the payment note.

Payment Details:
- UPI ID: indirasuthanvece@oksbi
- Amount: ₹120
- Note: Add Team ID - ${teamId}

We will confirm your registration once payment is verified.

Best regards,
Nova Nexus Hub
Kings Engineering College
    `;
    
    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
  }
}

function sendContactConfirmationEmail(email, ticketId) {
  try {
    const subject = 'NEXORA 2K26 - Message Received';
    const body = `
Dear User,

Thank you for contacting us!

Your message has been received and assigned Ticket ID: ${ticketId}

We will respond to your query within 24-48 hours.

Best regards,
Nova Nexus Hub
Kings Engineering College
    `;
    
    MailApp.sendEmail(email, subject, body);
  } catch (error) {
    Logger.log('Email error: ' + error.toString());
  }
}

// ============================================
// CORS PREFLIGHT HANDLER
// ============================================

function doGet(e) {
  return ContentService
    .createTextOutput('NEXORA Backend API - POST requests only')
    .setMimeType(ContentService.MimeType.TEXT);
}
