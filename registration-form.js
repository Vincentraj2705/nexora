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
    console.log('Registration form script loaded');
    
    const teamSizeSelect = document.getElementById('teamSize');
    const soloSection = document.getElementById('soloSection');
    const duoSection = document.getElementById('duoSection');
    const form = document.getElementById('registrationForm');
    
    console.log('Form elements found:', {
        teamSizeSelect: !!teamSizeSelect,
        soloSection: !!soloSection, 
        duoSection: !!duoSection,
        form: !!form
    });
    
    if (!form) {
        console.error('Registration form not found! Check if the form ID is correct.');
        return;
    }
    
    // Function to update payment amounts based on team size
    function updatePaymentAmounts(teamSize) {
        const amountPerHead = 120;
        const totalAmount = parseInt(teamSize) * amountPerHead;
        
        console.log('Updating payment amounts for team size:', teamSize, 'Total:', totalAmount);
        
        // Update all payment amount displays on the page
        const paymentElements = {
            display: document.querySelector('.payment-amount-display'),
            modal: document.querySelector('.payment-amount-modal'),
            qr: document.querySelector('.qr-payment-amount'),
            grid: document.querySelector('.payment-amount-grid'),
            text: document.querySelector('.payment-amount-text')
        };
        
        const displayText = teamSize === '1' ? 
            `₹${totalAmount}` : 
            `₹${totalAmount} (₹${amountPerHead} × ${teamSize} members)`;
        
        if (paymentElements.display) {
            paymentElements.display.textContent = displayText;
        }
        if (paymentElements.modal) {
            paymentElements.modal.textContent = displayText;
        }
        if (paymentElements.qr) {
            paymentElements.qr.textContent = displayText;
        }
        if (paymentElements.grid) {
            paymentElements.grid.textContent = displayText;
        }
        if (paymentElements.text) {
            paymentElements.text.innerHTML = `Pay <span style="color: var(--nexora-gold); font-weight: bold;">${displayText}</span> to confirm your registration`;
        }
        
        // Update the payment information card amount
        const paymentInfoAmount = document.querySelector('#paymentInfoCard .payment-amount-display');
        if (paymentInfoAmount) {
            paymentInfoAmount.textContent = displayText;
        }
        
        console.log('Payment amounts updated successfully');
    }
    
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
                updatePaymentAmounts('1');
            } else if (teamSize === '2') {
                duoSection.style.display = 'block';
                enableFields(duoSection);
                updatePaymentAmounts('2');
            }
        });
        
        // Set initial payment display for default selection
        const initialTeamSize = teamSizeSelect.value;
        if (initialTeamSize) {
            updatePaymentAmounts(initialTeamSize);
        } else {
            // Default to 1 member if no selection
            updatePaymentAmounts('1');
        }
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
        console.log('Adding submit event listener to form');
        
        form.addEventListener('submit', async function(e) {
            try {
                console.log('Form submit event triggered');
                e.preventDefault();
                
                // Get basic form values first
                const teamName = document.getElementById('teamName').value.trim();
                const eventName = document.getElementById('eventName').value;
                const teamSize = document.getElementById('teamSize').value;
                
                console.log('Form values:', { teamName, eventName, teamSize });
            
            // Honeypot check (anti-bot) - Enhanced
            if (!checkHoneypot()) {
                console.log('Bot detected via honeypot');
                showMessage('error', 'Invalid submission detected.');
                return;
            }
            
            // Additional bot detection
            const now = Date.now();
            if (now - lastSubmission < 5000 && lastSubmission > 0) {
                showMessage('error', 'Please slow down. Wait a moment before submitting.');
                return;
            }
            
            // Rate limiting check
            if (now - lastSubmission < SUBMISSION_COOLDOWN) {
                const remainingTime = Math.ceil((SUBMISSION_COOLDOWN - (now - lastSubmission)) / 1000);
                showMessage('error', `Please wait ${remainingTime} seconds before submitting again.`);
                return;
            }
            
            // Enhanced validation and security checks
            if (!teamName || !eventName || !teamSize) {
                showMessage('error', 'Please fill in all required fields.');
                return;
            }
            
            if (teamName.length < 2 || teamName.length > 50) {
                showMessage('error', 'Team name must be between 2 and 50 characters.');
                return;
            }
            
            // Check for suspicious patterns (XSS, script injection attempts)
            const suspiciousPatterns = /<script|javascript:|onerror=|onclick=|onload=|eval\(|alert\(/gi;
            const allInputs = [teamName, 
                document.getElementById('soloName')?.value || '', 
                document.getElementById('leaderName')?.value || '', 
                document.getElementById('mateName')?.value || '',
                document.getElementById('soloCollege')?.value || '',
                document.getElementById('duoCollege')?.value || ''
            ].join(' ');
            
            if (suspiciousPatterns.test(allInputs)) {
                console.log('Suspicious input detected:', allInputs.match(suspiciousPatterns));
                showMessage('error', 'Invalid characters detected. Please remove any special code or scripts from your input.');
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
                
                // Enhanced security validation for solo member
                if (!validatePhone(phone)) {
                    showMessage('error', 'Please enter a valid 10-digit Indian mobile number.');
                    return;
                }
                
                // Check for suspicious patterns in all fields
                if (suspiciousPatterns.test(name + college)) {
                    showMessage('error', 'Invalid characters detected. Please remove any special code or scripts.');
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
                
                // Enhanced security validation for duo team
                if (!validatePhone(phone)) {
                    showMessage('error', 'Please enter a valid 10-digit Indian mobile number.');
                    return;
                }
                
                // Check for suspicious patterns in all fields
                if (suspiciousPatterns.test(leaderName + mateName + college)) {
                    showMessage('error', 'Invalid characters detected. Please remove any special code or scripts.');
                    return;
                }
            }
            
            // Disable submit button and show processing popup
            const submitBtn = form.querySelector('.submit-btn');
            let originalText = '<i class="fas fa-paper-plane"></i> Submit Registration'; // Default fallback
            
            if (submitBtn) {
                originalText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            } else {
                console.error('Submit button not found!');
                showMessage('error', 'Submit button not found. Please refresh the page.');
                return;
            }
            
            // Show processing popup
            showProcessingPopup();
            
            try {
                // Prepare form data as URL-encoded string with sanitization and security data
                const formData = new URLSearchParams();
                formData.append('teamName', sanitizeInput(teamName));
                formData.append('eventName', sanitizeInput(eventName));
                formData.append('teamSize', teamSize);
                formData.append('timestamp', now);
                formData.append('userAgent', navigator.userAgent.substring(0, 200));
                formData.append('userIP', 'client'); // Real IP will be detected server-side
                formData.append('website', document.getElementById('website')?.value || ''); // Honeypot field
                
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
                const submitBtn = form.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText || '<i class="fas fa-paper-plane"></i> Submit Registration';
                }
            }
            } catch (formError) {
                console.error('Form submission error:', formError);
                showMessage('error', 'Form submission error occurred. Please try again.');
                
                // Re-enable submit button
                const submitBtn = form.querySelector('.submit-btn');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Registration';
                }
            }
        });
    } else {
        console.error('Registration form element not found! Make sure the form has id="registrationForm"');
        alert('Error: Registration form not found. Please check the page setup.');
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

// Payment Modal Functions - Enhanced with proper amount updates
function showPaymentModal(teamId) {
    const modal = document.getElementById('paymentModal');
    if (modal && teamId) {
        // Calculate payment amount based on team size
        const teamSize = document.getElementById('teamSize')?.value || '1';
        const amountPerHead = 120;
        const totalAmount = parseInt(teamSize) * amountPerHead;
        
        console.log('Showing payment modal - Team Size:', teamSize, 'Total Amount:', totalAmount);
        
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
        
        // Update ALL payment amount displays in the modal with correct amounts
        
        // 1. Update the main payment amount span in the modal
        const modalAmountSpan = modal.querySelector('.modal-amount-span');
        if (modalAmountSpan) {
            modalAmountSpan.textContent = `₹${totalAmount}`;
        }
        
        // 2. Update the payment text
        const paymentAmountText = modal.querySelector('.payment-amount-text');
        if (paymentAmountText) {
            paymentAmountText.innerHTML = `Pay <span class="modal-amount-span" style="color: var(--nexora-gold); font-weight: bold;">₹${totalAmount}</span> to confirm your registration`;
        }
        
        // 3. Update Pay Now button text with correct amount
        const payBtnText = modal.querySelector('.pay-btn-text');
        if (payBtnText) {
            payBtnText.textContent = `Pay ₹${totalAmount} Now via UPI (Team ID Auto-Added)`;
        }
        
        // 4. Update QR code images if you have different QR codes for different amounts
        const qrImages = modal.querySelectorAll('.qr-code-image, .mobile-qr-code-image');
        qrImages.forEach(img => {
            if (totalAmount === 240) {
                img.src = 'upi_payment_240rs.png';
                img.onerror = function() {
                    // Fallback to generic QR if specific amount QR doesn't exist
                    this.src = 'upi_payment_120rs.png';
                };
            } else {
                img.src = 'upi_payment_120rs.png';
            }
        });
        
        // Store the amount and team data for UPI function
        modal.setAttribute('data-amount', totalAmount);
        modal.setAttribute('data-team-id', teamId);
        modal.setAttribute('data-team-size', teamSize);
        
        console.log('Modal data set:', {
            amount: totalAmount,
            teamId: teamId,
            teamSize: teamSize
        });
        
        // Detect device type
        const isMobile = detectDevice();
        
        // Configure display based on device - simplified
        const qrSection = document.getElementById('qrSection');
        const payButton = modal.querySelector('.pay-now-btn');
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
        
        console.log('Payment modal configured for:', isMobile ? 'Mobile' : 'Desktop', '| Team ID:', teamId, '| Amount:', totalAmount);
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



// Open UPI app on mobile - Enhanced version with dynamic amount
function openUPIApp() {
    // Get team ID and amount from modal data (set by showPaymentModal)
    const modal = document.getElementById('paymentModal');
    let teamId = 'UNKNOWN';
    let totalAmount = 120; // Default fallback
    let teamSize = '1';
    
    if (modal) {
        const modalAmount = modal.getAttribute('data-amount');
        const modalTeamId = modal.getAttribute('data-team-id');
        const modalTeamSize = modal.getAttribute('data-team-size');
        
        if (modalAmount) totalAmount = parseInt(modalAmount);
        if (modalTeamId) teamId = modalTeamId;
        if (modalTeamSize) teamSize = modalTeamSize;
        
        console.log('Using modal data:', { totalAmount, teamId, teamSize });
    } else {
        console.warn('Modal not found, using fallback method');
        
        // Fallback: Get from form and calculate
        teamId = document.getElementById('teamIdDisplay')?.textContent?.trim() ||
                 document.getElementById('paymentTeamId')?.textContent?.trim() ||
                 document.getElementById('qrTeamId')?.textContent?.trim() ||
                 'UNKNOWN';
        
        teamSize = document.getElementById('teamSize')?.value || '1';
        totalAmount = parseInt(teamSize) * 120;
    }
    
    console.log('Opening UPI App with:', {
        teamId: teamId,
        amount: totalAmount,
        teamSize: teamSize
    });
    
    // Use shorter transaction note to avoid UPI app limitations
    const transactionNote = `NEXORA-${teamId}`;
    
    // Double-encode for better compatibility with different UPI apps
    const encodedNote = encodeURIComponent(transactionNote);
    const upiUrl = `upi://pay?pa=indirasuthanvece@oksbi&pn=Indirasuthan%20Vijaya&am=${totalAmount}&cu=INR&tn=${encodedNote}&mc=5411`;
    
    console.log('UPI URL:', upiUrl);
    
    try {
        // Try to open UPI app
        window.location.href = upiUrl;
        
        // Show success message with complete details
        setTimeout(() => {
            alert(`✅ UPI Payment Opened Successfully!\\n\\nTeam ID: ${teamId}\\nTeam Size: ${teamSize} member${teamSize === '1' ? '' : 's'}\\nAmount: ₹${totalAmount}\\nPayment Note: ${transactionNote}\\n\\n⚠️ VERIFY: Check that your payment app shows:\\n• Amount: ₹${totalAmount}\\n• Note: "${transactionNote}"\\n\\nIf the details don't match, please cancel and try again.`);
        }, 1500);
        
    } catch (error) {
        console.error('Error opening UPI app:', error);
        
        // Fallback alert with manual payment details
        alert(`❌ UPI App Error\\n\\nManual Payment Details:\\n• UPI ID: indirasuthanvece@oksbi\\n• Amount: ₹${totalAmount}\\n• Note: ${transactionNote}\\n• Team ID: ${teamId}\\n• Team Size: ${teamSize} member${teamSize === '1' ? '' : 's'}\\n\\nPlease make payment manually and include the note exactly as shown above.`);
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

// Debug function to check payment amounts (for testing)
function debugPaymentAmounts() {
    const teamSize = document.getElementById('teamSize')?.value || 'none';
    const modal = document.getElementById('paymentModal');
    const modalAmount = modal?.getAttribute('data-amount') || 'not set';
    const modalTeamId = modal?.getAttribute('data-team-id') || 'not set';
    
    console.log('=== Payment Debug Info ===');
    console.log('Current Team Size:', teamSize);
    console.log('Modal Amount:', modalAmount);
    console.log('Modal Team ID:', modalTeamId);
    
    // Check all payment amount elements
    const elements = {
        display: document.querySelector('.payment-amount-display'),
        modal: document.querySelector('.payment-amount-modal'),
        qr: document.querySelector('.qr-payment-amount'),
        grid: document.querySelector('.payment-amount-grid'),
        modalSpan: document.querySelector('.modal-amount-span')
    };
    
    Object.entries(elements).forEach(([name, el]) => {
        console.log(`${name}:`, el ? `"${el.textContent || el.innerHTML}"` : 'NOT FOUND');
    });
    
    const expectedAmount = teamSize !== 'none' ? parseInt(teamSize) * 120 : 'N/A';
    console.log('Expected Amount:', expectedAmount);
    
    return { teamSize, modalAmount, modalTeamId, expectedAmount };
}

// Test function to check if form submission is working
function testFormSubmission() {
    const form = document.getElementById('registrationForm');
    if (!form) {
        console.error('Form not found!');
        return false;
    }
    
    console.log('Form found:', form);
    console.log('Form action:', form.action);
    console.log('Form method:', form.method);
    
    const submitBtn = form.querySelector('.submit-btn');
    console.log('Submit button found:', !!submitBtn);
    console.log('Submit button disabled:', submitBtn?.disabled);
    
    // Test if form elements are accessible
    const elements = {
        teamName: document.getElementById('teamName'),
        eventName: document.getElementById('eventName'),
        teamSize: document.getElementById('teamSize')
    };
    
    console.log('Form elements:', elements);
    
    return true;
}

// Test function to simulate payment modal with different team sizes
function testPaymentModal(teamSize = '2', teamId = 'TEST-ABC123') {
    console.log(`Testing payment modal with ${teamSize} members`);
    
    // Temporarily set team size for testing
    const teamSizeSelect = document.getElementById('teamSize');
    if (teamSizeSelect) {
        teamSizeSelect.value = teamSize;
    }
    
    // Show payment modal
    showPaymentModal(teamId);
    
    // Check if amounts are correct
    setTimeout(() => {
        const modal = document.getElementById('paymentModal');
        const expectedAmount = parseInt(teamSize) * 120;
        
        console.log('=== Payment Modal Test Results ===');
        console.log('Expected Amount:', expectedAmount);
        console.log('Modal data-amount:', modal?.getAttribute('data-amount'));
        console.log('Modal amount span text:', document.querySelector('.modal-amount-span')?.textContent);
        console.log('Pay button text:', document.querySelector('.pay-btn-text')?.textContent);
        
        // Verify amounts
        const isCorrect = modal?.getAttribute('data-amount') == expectedAmount;
        console.log('Payment amounts correct:', isCorrect ? '✅' : '❌');
        
        if (!isCorrect) {
            console.error('Payment amounts don\'t match! Expected:', expectedAmount, 'Got:', modal?.getAttribute('data-amount'));
        }
    }, 100);
}
