// Typewriter Effect
function typeWriter() {
    const text = "Welcome to NEXORA 2K26";
    const element = document.querySelector('.typewriter-text');
    if (!element) return;
    let charIndex = 0;
    let isDeleting = false;
    function type() {
        if (!isDeleting && charIndex <= text.length) {
            element.textContent = text.substring(0, charIndex);
            charIndex++;
            setTimeout(type, 100); // Typing speed
        } else if (!isDeleting && charIndex > text.length) {
            setTimeout(() => {
                isDeleting = true;
                type();
            }, 2000); // Pause before deleting
        } else if (isDeleting && charIndex >= 0) {
            element.textContent = text.substring(0, charIndex);
            charIndex--;
            setTimeout(type, 50); // Deleting speed
        } else if (isDeleting && charIndex < 0) {
            isDeleting = false;
            charIndex = 0;
            setTimeout(type, 500); // Pause before retyping
        }
    }
    type();
}

const REGISTRATION_DEADLINE = new Date(2026, 2, 25, 18, 0, 0); // 25/03/2026 6:00 PM
const REGISTRATION_OPEN_MESSAGE = 'Registration closes by 6 PM 25/03/2026 - Nova Nexus Club';
const REGISTRATION_CLOSED_MESSAGE = 'Registration closed wait for the next event - Nova Nexus Club';

function isRegistrationClosed() {
    return new Date() >= REGISTRATION_DEADLINE;
}

function ensureRunningMessageBanner() {
    let messageBanner = document.getElementById('runningMessageBanner');
    let messageTextEl = document.getElementById('messageText');

    if (!messageBanner) {
        messageBanner = document.createElement('div');
        messageBanner.id = 'runningMessageBanner';
        messageBanner.className = 'running-message-banner';
        messageBanner.innerHTML = '<div class="running-message-content"><span id="messageText" class="message-text"></span></div>';

        const navbar = document.querySelector('.navbar');
        if (navbar && navbar.parentNode) {
            navbar.insertAdjacentElement('afterend', messageBanner);
        } else {
            document.body.prepend(messageBanner);
        }
    }

    if (!messageTextEl) {
        messageTextEl = messageBanner.querySelector('#messageText');
    }

    return { messageBanner, messageTextEl };
}

function updateRunningMessage() {
    const bannerParts = ensureRunningMessageBanner();
    if (!bannerParts || !bannerParts.messageBanner || !bannerParts.messageTextEl) {
        return;
    }

    const closed = isRegistrationClosed();
    const text = closed ? REGISTRATION_CLOSED_MESSAGE : REGISTRATION_OPEN_MESSAGE;

    bannerParts.messageBanner.style.background = closed
        ? 'linear-gradient(90deg, #dc2626 0%, #991b1b 50%, #dc2626 100%)'
        : 'linear-gradient(90deg, #ff9800 0%, #ffd700 50%, #ff9800 100%)';

    bannerParts.messageTextEl.textContent = `${text}   |   ${text}   |   ${text}`;
}

function ensureHomeCountdown() {
    if (!document.body.classList.contains('home')) {
        return null;
    }

    let countdown = document.getElementById('registrationCountdown');
    if (!countdown) {
        const heroContent = document.querySelector('.hero-content');
        if (!heroContent) {
            return null;
        }

        countdown = document.createElement('div');
        countdown.id = 'registrationCountdown';
        countdown.className = 'countdown-timer';
        countdown.innerHTML = `
            <h3 id="countdownTitle" class="countdown-title">Registration Ends In</h3>
            <div class="countdown-boxes">
                <div class="countdown-box countdown-days">
                    <div id="countdownDays" class="countdown-number">00</div>
                    <div class="countdown-label">Days</div>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-box">
                    <div id="countdownHours" class="countdown-number">00</div>
                    <div class="countdown-label">Hours</div>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-box">
                    <div id="countdownMinutes" class="countdown-number">00</div>
                    <div class="countdown-label">Minutes</div>
                </div>
                <div class="countdown-separator">:</div>
                <div class="countdown-box">
                    <div id="countdownSeconds" class="countdown-number">00</div>
                    <div class="countdown-label">Seconds</div>
                </div>
            </div>
        `;

        const eventsGrid = heroContent.querySelector('.events-grid');
        if (eventsGrid) {
            heroContent.insertBefore(countdown, eventsGrid);
        } else {
            heroContent.appendChild(countdown);
        }
    }

    return countdown;
}

function updateHomeCountdown() {
    const countdown = ensureHomeCountdown();
    if (!countdown) {
        return;
    }

    const now = new Date();
    const timeLeft = REGISTRATION_DEADLINE.getTime() - now.getTime();
    const titleEl = document.getElementById('countdownTitle');
    const daysEl = document.getElementById('countdownDays');
    const hoursEl = document.getElementById('countdownHours');
    const minutesEl = document.getElementById('countdownMinutes');
    const secondsEl = document.getElementById('countdownSeconds');

    if (!titleEl || !daysEl || !hoursEl || !minutesEl || !secondsEl) {
        return;
    }

    if (timeLeft <= 0) {
        titleEl.textContent = 'Registration Closed';
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
    }

    const totalSeconds = Math.floor(timeLeft / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    titleEl.textContent = 'Registration Ends In';
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Event countdown and registration status
function updateEventStatus() {
    updateRunningMessage();
    updateHomeCountdown();
}

document.addEventListener('DOMContentLoaded', function() {
    updateEventStatus();
    setInterval(updateEventStatus, 1000);
    if (document.querySelector('.typewriter-text')) {
        typeWriter();
    }
});

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
if (navLinks.length > 0) {
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) navMenu.classList.remove('active');
            if (hamburger) hamburger.classList.remove('active');
        });
    });
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 80;
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 20, 16, 0.98)';
        navbar.style.boxShadow = '0 5px 20px rgba(255, 152, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(26, 20, 16, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(255, 152, 0, 0.2)';
    }
});

// FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        
        // Close all FAQ items
        faqItems.forEach(faqItem => {
            faqItem.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            item.classList.add('active');
        }
    });
});

// Form Validation and Submission
const registerForm = document.querySelector('.register-form');
const contactForm = document.querySelector('.contact-form form');

if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData);
        
        // Basic validation
        let isValid = true;
        const requiredFields = ['team-name', 'leader-name', 'email', 'phone', 'department', 'year', 'team-size', 'theme', 'members'];
        
        requiredFields.forEach(field => {
            const input = registerForm.querySelector(`[name="${field}"]`);
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#ef4444';
            } else {
                input.style.borderColor = '';
            }
        });
        
        if (isValid) {
            // In a real application, you would send this data to a server
            console.log('Registration Data:', data);
            
            // Show success message
            alert('Registration submitted successfully! We will contact you soon.');
            registerForm.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // In a real application, you would send this data to a server
        console.log('Contact Form Data:', data);
        
        // Show success message
        alert('Message sent successfully! We will get back to you soon.');
        contactForm.reset();
    });
}

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all section elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.theme-card, .feature, .prize-card, .timeline-item, .faq-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}

console.log('NEXORA - Website Loaded Successfully! 🚀');
console.log('Nova Nexus Hub - Kings Engineering College');
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation (Indian format)
function validatePhone(phone) {
    const re = /^[6-9]\d{9}$/;
    return re.test(phone);
}

// Add real-time validation to email and phone fields
document.addEventListener('DOMContentLoaded', () => {
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    
    emailInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validateEmail(input.value)) {
                input.style.borderColor = '#ef4444';
                showError(input, 'Please enter a valid email address');
            } else {
                input.style.borderColor = '';
                hideError(input);
            }
        });
    });
    
    phoneInputs.forEach(input => {
        input.addEventListener('blur', () => {
            if (input.value && !validatePhone(input.value)) {
                input.style.borderColor = '#ef4444';
                showError(input, 'Please enter a valid 10-digit phone number');
            } else {
                input.style.borderColor = '';
                hideError(input);
            }
        });
    });
});

function showError(input, message) {
    hideError(input); // Remove any existing error
    const error = document.createElement('span');
    error.className = 'error-message';
    error.style.color = '#ef4444';
    error.style.fontSize = '0.85rem';
    error.textContent = message;
    input.parentElement.appendChild(error);
}

function hideError(input) {
    const error = input.parentElement.querySelector('.error-message');
    if (error) {
        error.remove();
    }
}

// Add loading animation
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    loader.appendChild(spinner);
    
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Print registration details (optional feature)
function printRegistration() {
    window.print();
}

console.log('NEXORA - Website Loaded Successfully! 🚀');
console.log('Nova Nexus Hub - Kings Engineering College');

// Problem Statement Filter Functionality
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const problemRows = document.querySelectorAll('.problem-table tbody tr');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter rows
            problemRows.forEach(row => {
                const category = row.getAttribute('data-category');
                
                if (filter === 'all' || category === filter) {
                    row.classList.remove('hidden');
                    setTimeout(() => {
                        row.style.display = '';
                    }, 10);
                } else {
                    row.classList.add('hidden');
                    row.style.display = 'none';
                }
            });
        });
    });
});

// Email validation
