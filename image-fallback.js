/**
 * Image Fallback Handler
 * Handles image loading errors without inline onerror handlers
 * This is a security best practice to avoid inline event handlers
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle all images with fallback behavior
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // Add error event listener
        img.addEventListener('error', function() {
            // Hide the image if it fails to load
            this.style.display = 'none';
            
            // Log error for debugging (optional)
            console.log('Image failed to load:', this.src);
        });
        
        // Optional: Add loading class for better UX
        if (!img.complete) {
            img.classList.add('loading');
        }
        
        // Remove loading class when image loads
        img.addEventListener('load', function() {
            this.classList.remove('loading');
        });
    });
    
    // Handle specific fallback scenarios
    handleLogoFallbacks();
    handleSponsorFallbacks();
});

/**
 * Handle logo image fallbacks
 */
function handleLogoFallbacks() {
    const logos = document.querySelectorAll('.logo-img, .nova-logo, .college-logo');
    
    logos.forEach(logo => {
        logo.addEventListener('error', function() {
            // For logos, we might want to show a placeholder
            this.style.display = 'none';
            
            // Optional: Add a text fallback
            const fallback = document.createElement('div');
            fallback.className = 'logo-fallback';
            fallback.textContent = this.alt || 'Logo';
            fallback.style.cssText = 'padding: 10px; background: rgba(255,152,0,0.1); border-radius: 5px; color: var(--nexora-orange);';
            
            if (this.parentNode) {
                this.parentNode.insertBefore(fallback, this.nextSibling);
            }
        });
    });
}

/**
 * Handle sponsor logo fallbacks
 */
function handleSponsorFallbacks() {
    const sponsorLogos = document.querySelectorAll('.sponsor-logos img');
    
    sponsorLogos.forEach(logo => {
        logo.addEventListener('error', function() {
            // Hide failed sponsor logos silently
            this.style.display = 'none';
        });
    });
}

/**
 * Preload critical images
 * This helps prevent errors by loading images early
 */
function preloadCriticalImages() {
    const criticalImages = [
        'kings-logo.png',
        'novanexus-logo.png',
        'NEXORA-logo.png'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Preload on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalImages);
} else {
    preloadCriticalImages();
}
