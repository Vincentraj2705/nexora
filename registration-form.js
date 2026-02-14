// Registration Form Handler
// Paste your Web App URL here:
const REGISTRATION_FORM_URL = 'https://script.google.com/macros/s/AKfycbyzBOdOSxoi_rQoxb9NK6jRNgw0VqXmUS1VYAVOp5lZdRTdUgtARg_2dKJ3uX0lxKWl/exec';

// Enhanced Security utilities
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    // Remove all HTML tags and dangerous characters
    return input
        .trim()
        .replace(/[<>'"&]/g, (char) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '&': '&amp;'
            };
            return entities[char] || char;
        })
        .substring(0, 500); // Limit length
}

// Enhanced email validation
function validateEmail(email) {
    const re = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return re.test(email) && email.length <= 254;
}

// Enhanced phone validation
function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleaned);
}

// Honeypot check (anti-bot)
function checkHoneypot() {
    const honeypot = document.getElementById('website');
    return !honeypot || honeypot.value === '';
}

// Rate limiting - track submissions
let lastSubmission = 0;
const SUBMISSION_COOLDOWN = 30000; // 30 seconds between submissions

// Show message function with XSS protection
function showMessage(type, text) {
    // Remove any existing messages
    const existingMsg = document.querySelector('.form-popup-message');
    if (existingMsg) {
        existingMsg.remove();
    }
    
    // Sanitize type parameter
    const validTypes = ['success', 'error'];
    const safeType = validTypes.includes(type) ? type : 'error';
    
    // Create popup message
    const popup = document.createElement('div');
    popup.className = `form-popup-message form-popup-${safeType}`;
    
    // Use textContent to prevent XSS
    const popupContent = document.createElement('div');
    popupContent.className = 'popup-content';
    
    const icon = document.createElement('i');
    icon.className = `fas fa-${safeType === 'success' ? 'check-circle' : 'exclamation-circle'}`;
    
    const span = document.createElement('span');
    span.textContent = text; // Safe from XSS
    
    popupContent.appendChild(icon);
    popupContent.appendChild(span);
    popup.appendChild(popupContent);
    
    // Add to body
    document.body.appendChild(popup);
    
    // Trigger animation
    setTimeout(() => popup.classList.add('show'), 10);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 300);
    }, 3000);
}

// Handle team size change
document.addEventListener('DOMContentLoaded', function() {
    const teamSizeSelect = document.getElementById('teamSize');
    const soloSection = document.getElementById('soloSection');
    const duoSection = document.getElementById('duoSection');
    const form = document.getElementById('registrationForm');
    
    // Team size change handler
    if (teamSizeSelect) {
        teamSizeSelect.addEventListener('change', function() {
            const teamSize = this.value;
            
            // Hide both sections first
            soloSection.style.display = 'none';
            duoSection.style.display = 'none';
            
            // Clear and disable all fields in hidden sections
            clearAndDisableFields(soloSection);
            clearAndDisableFields(duoSection);
            
            // Show and enable appropriate section
            if (teamSize === '1') {
                soloSection.style.display = 'block';
                enableFields(soloSection);
            } else if (teamSize === '2') {
                duoSection.style.display = 'block';
                enableFields(duoSection);
            }
        });
    }
    
    // Helper function to clear and disable fields
    function clearAndDisableFields(section) {
        const inputs = section.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.value = '';
            input.removeAttribute('required');
            input.disabled = true;
        });
    }
    
    // Helper function to enable fields
    function enableFields(section) {
        const inputs = section.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.disabled = false;
            // Add required attribute to all except checkbox
            if (input.type !== 'checkbox') {
                input.setAttribute('required', 'required');
            }
        });
    }
    
    // Form submission handler
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Honeypot check (anti-bot)
            if (!checkHoneypot()) {
                console.log('Bot detected');
                return;
            }
            
            // Rate limiting check
            const now = Date.now();
            if (now - lastSubmission < SUBMISSION_COOLDOWN) {
                const remainingTime = Math.ceil((SUBMISSION_COOLDOWN - (now - lastSubmission)) / 1000);
                showMessage('error', `Please wait ${remainingTime} seconds before submitting again.`);
                return;
            }
            
            // Get team size
            const teamSize = document.getElementById('teamSize').value;
            
            // Validate basic fields
            const teamName = document.getElementById('teamName').value.trim();
            const eventName = document.getElementById('eventName').value;
            
            if (!teamName || !eventName || !teamSize) {
                showMessage('error', 'Please fill in all required fields.');
                return;
            }
            
            if (teamName.length < 2 || teamName.length > 50) {
                showMessage('error', 'Team name must be between 2 and 50 characters.');
                return;
            }
            
            // Check for suspicious patterns
            const suspiciousPatterns = /<script|javascript:|onerror=|onclick=/i;
            if (suspiciousPatterns.test(teamName)) {
                showMessage('error', 'Invalid team name. Please remove any special characters or code.');
                return;
            }
            
            // Validate team size specific fields
            if (teamSize === '1') {
                const name = document.getElementById('soloName').value.trim();
                const email = document.getElementById('soloEmail').value.trim();
                const phone = document.getElementById('soloPhone').value.trim();
                const college = document.getElementById('soloCollege').value.trim();
                
                if (!name || !email || !phone || !college) {
                    showMessage('error', 'Please fill in all required fields.');
                    return;
                }
                
                if (name.length < 2 || name.length > 50) {
                    showMessage('error', 'Name must be between 2 and 50 characters.');
                    return;
                }
                
                // Enhanced email validation
                if (!validateEmail(email)) {
                    showMessage('error', 'Please enter a valid email address.');
                    return;
                }
                
                // Enhanced phone validation
                if (!validatePhone(phone)) {
                    showMessage('error', 'Please enter a valid 10-digit Indian mobile number.');
                    return;
                }
                
                // Check for suspicious patterns
                if (suspiciousPatterns.test(name + college)) {
                    showMessage('error', 'Invalid input detected. Please remove any special characters or code.');
                    return;
                }
            } else if (teamSize === '2') {
                const leaderName = document.getElementById('leaderName').value.trim();
                const mateName = document.getElementById('mateName').value.trim();
                const email = document.getElementById('duoEmail').value.trim();
                const phone = document.getElementById('duoPhone').value.trim();
                const college = document.getElementById('duoCollege').value.trim();
                
                if (!leaderName || !mateName || !email || !phone || !college) {
                    showMessage('error', 'Please fill in all required fields.');
                    return;
                }
                
                if (leaderName.length < 2 || leaderName.length > 50 || mateName.length < 2 || mateName.length > 50) {
                    showMessage('error', 'Names must be between 2 and 50 characters.');
                    return;
                }
                
                // Enhanced email validation
                if (!validateEmail(email)) {
                    showMessage('error', 'Please enter a valid email address.');
                    return;
                }
                
                // Enhanced phone validation
                if (!validatePhone(phone)) {
                    showMessage('error', 'Please enter a valid 10-digit Indian mobile number.');
                    return;
                }
                
                // Check for suspicious patterns
                if (suspiciousPatterns.test(leaderName + mateName + college)) {
                    showMessage('error', 'Invalid input detected. Please remove any special characters or code.');
                    return;
                }
            }
            
            // Disable submit button and show processing popup
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            
            // Show processing popup
            showProcessingPopup();
            
            try {
                // Prepare form data as URL-encoded string with sanitization
                const formData = new URLSearchParams();
                formData.append('teamName', sanitizeInput(teamName));
                formData.append('eventName', sanitizeInput(eventName));
                formData.append('teamSize', teamSize);
                formData.append('timestamp', now);
                formData.append('userAgent', navigator.userAgent.substring(0, 200));
                
                if (teamSize === '1') {
                    // Solo member data
                    formData.append('name', sanitizeInput(document.getElementById('soloName').value));
                    formData.append('college', sanitizeInput(document.getElementById('soloCollege').value));
                    formData.append('department', sanitizeInput(document.getElementById('soloDepartment').value));
                    formData.append('year', document.getElementById('soloYear').value);
                    formData.append('phone', sanitizeInput(document.getElementById('soloPhone').value));
                    formData.append('email', sanitizeInput(document.getElementById('soloEmail').value));
                } else if (teamSize === '2') {
                    // Duo team data
                    formData.append('leaderName', sanitizeInput(document.getElementById('leaderName').value));
                    formData.append('mateName', sanitizeInput(document.getElementById('mateName').value));
                    formData.append('college', sanitizeInput(document.getElementById('duoCollege').value));
                    formData.append('department', sanitizeInput(document.getElementById('duoDepartment').value));
                    formData.append('year', document.getElementById('duoYear').value);
                    formData.append('phone', sanitizeInput(document.getElementById('duoPhone').value));
                    formData.append('email', sanitizeInput(document.getElementById('duoEmail').value));
                }
                
                // Submit to Google Apps Script with timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
                
                const response = await fetch(REGISTRATION_FORM_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    // Sanitize response data before displaying
                    const teamId = sanitizeInput(String(result.teamId || 'N/A'));
                    showMessage('success', `Registration successful! Your Team ID: ${teamId}. Check your email for details.`);
                    form.reset();
                    soloSection.style.display = 'none';
                    duoSection.style.display = 'none';
                    lastSubmission = now;
                    
                    // Hide processing popup and show payment modal with team ID
                    hideProcessingPopup();
                    setTimeout(() => {
                        showPaymentModal(teamId);
                    }, 1000);
                } else {
                    hideProcessingPopup();
                    const errorMsg = sanitizeInput(String(result.message || 'Registration failed. Please try again.'));
                    showMessage('error', errorMsg);
                }
            } catch (error) {
                console.error('Error:', error);
                hideProcessingPopup();
                // Generic error message (don't expose details)
                if (error.name === 'AbortError') {
                    showMessage('error', 'Request timeout. Please try again.');
                } else {
                    showMessage('error', 'An error occurred. Please check your internet connection and try again.');
                }
            } finally {
                // Re-enable submit button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});

// Processing popup functions
function showProcessingPopup() {
    const modal = document.getElementById('processingModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideProcessingPopup() {
    const modal = document.getElementById('processingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Payment Modal Functions - Simplified design with device-specific layout
function showPaymentModal(teamId) {
    const modal = document.getElementById('paymentModal');
    if (modal && teamId) {
        // Update all Team ID displays in the modal
        const teamIdElements = {
            main: document.getElementById('teamIdDisplay'),
            qr: document.getElementById('qrTeamId'),
            payment: document.getElementById('paymentTeamId'),
            mobileQr: document.getElementById('mobileQrTeamId')
        };
        
        Object.values(teamIdElements).forEach(el => {
            if (el) el.textContent = teamId;
        });
        
        // Detect device type
        const isMobile = detectDevice();
        
        // Configure display based on device - simplified
        const qrSection = document.getElementById('qrSection');
        const payButton = document.querySelector('.pay-now-btn');
        const mobileQrSection = document.getElementById('mobileQrSection');
        
        if (isMobile) {
            // Mobile: Show Pay button and only mobile QR section
            if (qrSection) qrSection.style.display = 'none';
            if (payButton) payButton.style.display = 'flex';
            if (mobileQrSection) mobileQrSection.style.display = 'block';
        } else {
            // Desktop: Show only main QR section, no Pay Now button
            if (qrSection) qrSection.style.display = 'block';
            if (payButton) payButton.style.display = 'none';
            if (mobileQrSection) mobileQrSection.style.display = 'none';
        }
        
        // Show modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        console.log('Payment modal configured for:', isMobile ? 'Mobile' : 'Desktop', '| Team ID:', teamId);
    }
}

// Device detection function
function detectDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'iemobile', 'opera mini'];
    const isMobileUserAgent = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isMobileScreen = window.innerWidth <= 767;
    
    return isMobileUserAgent || isMobileScreen;
}

// Legacy function for compatibility
function isMobile() {
    return detectDevice();
}



// Open UPI app on mobile - Enhanced version with auto team ID
function openUPIApp() {
    // Get team ID with multiple fallback attempts
    let teamId = document.getElementById('teamIdDisplay')?.textContent?.trim();
    
    if (!teamId || teamId === '-' || teamId === '') {
        // Try other team ID elements as fallback
        teamId = document.getElementById('paymentTeamId')?.textContent?.trim() ||
                 document.getElementById('qrTeamId')?.textContent?.trim() ||
                 document.getElementById('mobileQrTeamId')?.textContent?.trim() ||
                 'UNKNOWN';
    }
    
    console.log('Team ID retrieved:', teamId);
    console.log('Team ID element content:', document.getElementById('teamIdDisplay')?.textContent);
    
    // Use shorter transaction note to avoid UPI app limitations
    // Format: "NEXORA-{TeamID}" to keep it concise
    const transactionNote = `NEXORA-${teamId}`;
    
    // Double-encode for better compatibility with different UPI apps
    const encodedNote = encodeURIComponent(transactionNote);
    const upiUrl = `upi://pay?pa=indirasuthanvece@oksbi&pn=Indirasuthan%20Vijaya&am=120&cu=INR&tn=${encodedNote}&mc=5411`;
    
    console.log('Transaction Note:', transactionNote);
    console.log('UPI URL:', upiUrl);
    
    try {
        // Try to open UPI app
        window.location.href = upiUrl;
        
        // Show success message with debugging info
        setTimeout(() => {
            alert(`✅ UPI Payment Opened Successfully!\n\nTeam ID: ${teamId}\nPayment Note: ${transactionNote}\n\n⚠️ VERIFY: Check that your payment app shows the note "${transactionNote}" before confirming payment.\n\nIf the note is missing, please add it manually.`);
        }, 1500);
        
    } catch (error) {
        console.error('Error opening UPI app:', error);
        
        // Fallback alert with manual payment details
        alert(`❌ UPI App Error\n\nManual Payment Details:\n• UPI ID: indirasuthanvece@oksbi\n• Amount: ₹120\n• Note: ${transactionNote}\n• Team ID: ${teamId}\n\nPlease make payment manually and include the note exactly as shown above.`);
    }
}

// Debug function to check team ID retrieval (for testing)
function debugTeamId() {
    const elements = {
        main: document.getElementById('teamIdDisplay'),
        payment: document.getElementById('paymentTeamId'),
        qr: document.getElementById('qrTeamId'),
        mobileQr: document.getElementById('mobileQrTeamId')
    };
    
    console.log('=== Team ID Debug Info ===');
    Object.entries(elements).forEach(([name, el]) => {
        console.log(`${name}:`, el ? `"${el.textContent}"` : 'NOT FOUND');
    });
    
    const teamId = document.getElementById('teamIdDisplay')?.textContent?.trim() || 'UNKNOWN';
    const note = `NEXORA-${teamId}`;
    console.log('Final Team ID:', teamId);
    console.log('Payment Note:', note);
    
    return { teamId, note };
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Copy Team ID with visual feedback
function copyTeamId() {
    const teamIdElement = document.getElementById('paymentTeamId');
    const teamId = teamIdElement?.textContent;
    
    if (teamId && teamId !== '-') {
        navigator.clipboard.writeText(teamId).then(() => {
            // Success feedback
            teamIdElement.style.background = 'rgba(34, 197, 94, 0.3)';
            teamIdElement.style.borderColor = '#22c55e';
            
            // Show temporary success message
            const originalText = teamIdElement.innerHTML;
            teamIdElement.innerHTML = `<i class="fas fa-check"></i> Copied!`;
            
            setTimeout(() => {
                teamIdElement.innerHTML = originalText;
                teamIdElement.style.background = 'rgba(59, 130, 246, 0.2)';
                teamIdElement.style.borderColor = '#3b82f6';
            }, 1500);
            
            console.log('Team ID copied:', teamId);
        }).catch(err => {
            console.error('Copy failed:', err);
            // Fallback to text selection
            selectText(teamIdElement);
        });
    } else {
        console.warn('No Team ID to copy');
    }
}

// Copy text to clipboard helper
function copyToClipboard(text, label) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('success', `${label} copied to clipboard!`);
    }).catch(() => {
        showMessage('error', 'Failed to copy. Please copy manually.');
    });
}

// Select text helper for manual copying with improved feedback
function selectText(element) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Enhanced visual feedback
    const originalBg = element.style.background;
    const originalBorder = element.style.borderColor;
    
    element.style.background = 'rgba(34, 197, 94, 0.3)';
    element.style.borderColor = '#22c55e';
    
    // Try to copy to clipboard if possible
    try {
        document.execCommand('copy');
        console.log('Text selected and copied via execCommand');
    } catch (err) {
        console.log('execCommand copy failed, text selected only');
    }
    
    setTimeout(() => {
        element.style.background = originalBg;
        element.style.borderColor = originalBorder;
    }, 1000);
}

// Payment info modal functions (for the card on registration page)
function openPaymentInfoModal() {
    const modal = document.getElementById('paymentInfoModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        console.log('Payment info modal opened');
    }
}

function closePaymentInfoModal() {
    const modal = document.getElementById('paymentInfoModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Payment info modal closed');
    }
}

// Copy to Clipboard Function
function copyToClipboard(text, type) {
    navigator.clipboard.writeText(text).then(() => {
        showMessage('success', `${type} copied to clipboard!`);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showMessage('error', 'Failed to copy. Please copy manually.');
    });
}
