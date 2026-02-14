// Contact Form Handler
// Paste your Web App URL here:
const CONTACT_FORM_URL = 'https://script.google.com/macros/s/AKfycbwmCrOdt7J-YlvH86hITuJa20EdFZsNLSJ-Qhy8otFLYyKQVCD3bdgHoKR7NrHPYyqF/exec';

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

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
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
            
            // Validate inputs
            const name = document.getElementById('contactName').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const phone = document.getElementById('contactPhone').value.trim();
            const subject = document.getElementById('contactSubject').value.trim();
            const message = document.getElementById('contactMessage').value.trim();
            
            // Input validation
            if (!name || !email || !phone || !message) {
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
            
            if (message.length < 10 || message.length > 1000) {
                showMessage('error', 'Message must be between 10 and 1000 characters.');
                return;
            }
            
            // Check for suspicious patterns
            const suspiciousPatterns = /<script|javascript:|onerror=|onclick=/i;
            if (suspiciousPatterns.test(name + email + message)) {
                showMessage('error', 'Invalid input detected. Please remove any special characters or code.');
                return;
            }
            
            // Get form data with sanitization
            const formData = new URLSearchParams();
            formData.append('name', sanitizeInput(name));
            formData.append('email', sanitizeInput(email));
            formData.append('phone', sanitizeInput(phone));
            formData.append('subject', sanitizeInput(subject));
            formData.append('message', sanitizeInput(message));
            
            // Get submit button
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            
            // Add timestamp and basic fingerprint for backend validation
            formData.append('timestamp', now);
            formData.append('userAgent', navigator.userAgent.substring(0, 200));
            
            // Send to backend with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            fetch(CONTACT_FORM_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData,
                signal: controller.signal
            })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    // Sanitize response data before displaying
                    const ticketId = sanitizeInput(String(data.ticketId || 'N/A'));
                    showMessage('success', `Message sent successfully! Ticket ID: ${ticketId}. Check your email.`);
                    contactForm.reset();
                    lastSubmission = now;
                } else {
                    const errorMsg = sanitizeInput(String(data.message || 'Failed to send message. Please try again.'));
                    showMessage('error', errorMsg);
                }
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                // Generic error message (don't expose details)
                if (error.name === 'AbortError') {
                    showMessage('error', 'Request timeout. Please try again.');
                } else {
                    showMessage('error', 'Failed to send message. Please check your internet connection and try again.');
                }
                console.error('Error:', error);
            })
            .finally(() => {
                // Reset button
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
        });
    }
});

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
