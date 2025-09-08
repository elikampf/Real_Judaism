/**
 * Real Judaism Website - Main JavaScript
 * Handles navigation, smooth scrolling, and general site functionality
 */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeSmoothScrolling();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeDropdowns();
    initializeContactForm();
    initializeLazyLoading();
    initializeCardHoverEffects();
    initializePerformanceOptimizations();
});

/**
 * Initialize Navigation with Analytics Tracking
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Track navigation click
            trackNavigationClick(this.href, this.textContent.trim());

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Close mobile menu if open
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
}

/**
 * Initialize Smooth Scrolling
 */
function initializeSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize Mobile Menu (for future responsive design)
 */
function initializeMobileMenu() {
    // Create mobile menu button if it doesn't exist
    if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
        const navContainer = document.querySelector('.nav-container');
        const navMenu = document.querySelector('.nav-menu');

        // Create mobile menu button
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-menu-btn';
        mobileBtn.innerHTML = '☰';
        mobileBtn.setAttribute('aria-label', 'Toggle mobile menu');

        // Create mobile menu overlay
        const mobileMenu = document.createElement('div');
        mobileMenu.className = 'mobile-menu';
        mobileMenu.innerHTML = navMenu.innerHTML;

        // Insert elements
        navContainer.appendChild(mobileBtn);
        navContainer.appendChild(mobileMenu);

        // Add event listener
        mobileBtn.addEventListener('click', toggleMobileMenu);
    }
}

/**
 * Toggle Mobile Menu
 */
function toggleMobileMenu() {
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileMenu.classList.toggle('active');
        mobileBtn.innerHTML = mobileMenu.classList.contains('active') ? '✕' : '☰';
    }
}

/**
 * Initialize Scroll Effects with Analytics Tracking
 */
function initializeScrollEffects() {
    const header = document.querySelector('.site-header');
    let scrollDepthTracked = { 25: false, 50: false, 75: false, 90: false };

    window.addEventListener('scroll', debounce(function() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = Math.round((scrollTop / docHeight) * 100);

        // Header scroll effect
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Track scroll depth milestones
        Object.keys(scrollDepthTracked).forEach(threshold => {
            if (!scrollDepthTracked[threshold] && scrollPercent >= parseInt(threshold)) {
                trackScrollDepth(parseInt(threshold));
                scrollDepthTracked[threshold] = true;
            }
        });
    }, 100));
}

/**
 * Initialize Dropdown Menus
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    
    dropdowns.forEach(dropdown => {
        const toggle = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (toggle && menu) {
            // Handle click on mobile
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    menu.classList.toggle('active');
                }
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!dropdown.contains(e.target)) {
                    menu.classList.remove('active');
                }
            });
        }
    });
}

/**
 * Initialize Contact Form with Analytics Tracking
 */
function initializeContactForm() {
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const name = this.querySelector('#name');
            const email = this.querySelector('#email');
            const message = this.querySelector('#message');
            const submitBtn = this.querySelector('button[type="submit"]');

            // Basic validation
            if (!name.value.trim()) {
                e.preventDefault();
                showFormError('Please enter your name.');
                name.focus();
                return;
            }

            if (!email.value.trim()) {
                e.preventDefault();
                showFormError('Please enter your email address.');
                email.focus();
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                e.preventDefault();
                showFormError('Please enter a valid email address.');
                email.focus();
                return;
            }

            if (!message.value.trim()) {
                e.preventDefault();
                showFormError('Please enter your message.');
                message.focus();
                return;
            }

            // Track form submission with GA4
            trackFormSubmission('contact_form', {
                form_name: 'contact',
                form_location: window.location.pathname,
                message_length: message.value.length
            });

            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                submitBtn.classList.add('loading');
            }
        });
    }

    // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                }
            });
        });
    }
}

/**
 * Show form error message
 */
function showFormError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.form-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error-message';
    errorDiv.style.cssText = `
        background-color: rgba(229, 62, 62, 0.1);
        border: 1px solid rgba(229, 62, 62, 0.2);
        color: #c53030;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        font-size: 14px;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    // Insert before form
    const contactForm = document.querySelector('.contact-form');
    contactForm.insertBefore(errorDiv, contactForm.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Validate individual form field
 */
function validateField(field) {
    const value = field.value.trim();

    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('error');
            return false;
        }
    }

    field.classList.remove('error');
    return true;
}

/**
 * Initialize Lazy Loading for Images
 */
function initializeLazyLoading() {
    // Create Intersection Observer for lazy loading
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                loadImage(img);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.01
    });

    // Find all images that should be lazy loaded
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        // Set up loading placeholder
        img.classList.add('lazy-loading');
        imageObserver.observe(img);
    });
}

/**
 * Load image when it comes into view
 */
function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (!src) return;

    // Create a new image to preload
    const newImg = new Image();
    newImg.onload = function() {
        // Replace with loaded image
        img.src = src;
        img.classList.remove('lazy-loading');
        img.classList.add('loaded');
        img.style.opacity = '1';
        console.log('Image loaded:', src);
    };
    newImg.onerror = function() {
        console.error('Failed to load image:', src);
        img.classList.remove('lazy-loading');
        img.classList.add('error');
    };
    newImg.src = src;
}

/**
 * Initialize Enhanced Card Hover Effects with Click Tracking
 */
function initializeCardHoverEffects() {
    // Add enhanced hover effects and click tracking to all series cards
    const seriesCards = document.querySelectorAll('.series-card-main');
    seriesCards.forEach(card => {
        card.addEventListener('mouseenter', handleCardHover);
        card.addEventListener('mouseleave', handleCardLeave);
        card.addEventListener('click', handleSeriesCardClick);
    });

    // Add hover effects to other cards
    const allCards = document.querySelectorAll('.card, .episode-card, .blog-card');
    allCards.forEach(card => {
        card.addEventListener('mouseenter', handleGenericCardHover);
        card.addEventListener('mouseleave', handleGenericCardLeave);
    });
}

/**
 * Handle series card hover
 */
function handleCardHover(e) {
    const card = e.currentTarget;
    const image = card.querySelector('.card-image-main');
    const overlay = card.querySelector('.card-overlay');
    const playIcon = card.querySelector('.card-play-icon');

    // Add lift effect
    card.style.transform = 'translateY(-6px) scale(1.02)';
    card.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.2)';

    // Enhance image scaling
    if (image) {
        image.style.transform = 'scale(1.1)';
    }

    // Show overlay with animation
    if (overlay) {
        overlay.style.opacity = '1';
        overlay.style.background = 'linear-gradient(135deg, rgba(237, 137, 54, 0.95), rgba(217, 119, 6, 0.95))';
    }

    // Animate play icon
    if (playIcon) {
        playIcon.style.transform = 'scale(1.3)';
        playIcon.style.animation = 'pulse 2s infinite';
    }
}

/**
 * Handle series card leave
 */
function handleCardLeave(e) {
    const card = e.currentTarget;
    const image = card.querySelector('.card-image-main');
    const overlay = card.querySelector('.card-overlay');
    const playIcon = card.querySelector('.card-play-icon');

    // Reset lift effect
    card.style.transform = '';
    card.style.boxShadow = '';

    // Reset image scaling
    if (image) {
        image.style.transform = '';
    }

    // Hide overlay
    if (overlay) {
        overlay.style.opacity = '';
        overlay.style.background = '';
    }

    // Reset play icon
    if (playIcon) {
        playIcon.style.transform = '';
        playIcon.style.animation = '';
    }
}

/**
 * Handle generic card hover
 */
function handleGenericCardHover(e) {
    const card = e.currentTarget;
    card.style.transform = 'translateY(-3px)';
    card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
}

/**
 * Handle generic card leave
 */
function handleGenericCardLeave(e) {
    const card = e.currentTarget;
    card.style.transform = '';
    card.style.boxShadow = '';
}

/**
 * Handle series card click for analytics tracking
 */
function handleSeriesCardClick(e) {
    const card = e.currentTarget;
    const titleElement = card.querySelector('.card-title-main');
    if (titleElement) {
        const seriesName = titleElement.textContent.trim();
        trackSeriesCardClick(seriesName, 'main');
    }
}

/**
 * Initialize Performance Optimizations
 */
function initializePerformanceOptimizations() {
    // Add passive event listeners where appropriate
    const passiveOptions = { passive: true };

    // Optimize scroll listeners
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach(element => {
        element.addEventListener('scroll', handleScroll, passiveOptions);
    });

    // Preload critical resources
    preloadCriticalResources();

    // Add resource hints for better loading
    addResourceHints();

    // Optimize for repaint/reflow
    optimizeForRepaint();
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
    // Preload hero background image
    const heroImage = document.querySelector('.hero-bg-image');
    if (heroImage) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = heroImage.src;
        document.head.appendChild(link);
    }

    // Preload episode data JSON
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'fetch';
    link.href = 'data/episodes.json';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
}

/**
 * Add resource hints for better loading
 */
function addResourceHints() {
    // DNS prefetch for external resources
    const dnsPrefetchDomains = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];

    dnsPrefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
    });
}

/**
 * Optimize for repaint/reflow
 */
function optimizeForRepaint() {
    // Use transform instead of changing layout properties
    const animatedElements = document.querySelectorAll('.series-card-main, .episode-card, .blog-card');
    animatedElements.forEach(element => {
        element.style.willChange = 'transform';
        element.style.backfaceVisibility = 'hidden';
    });

    // Clean up after animations
    setTimeout(() => {
        animatedElements.forEach(element => {
            element.style.willChange = 'auto';
        });
    }, 1000);
}

/**
 * Handle scroll events efficiently
 */
function handleScroll(e) {
    // Debounce scroll events
    clearTimeout(e.target.scrollTimeout);
    e.target.scrollTimeout = setTimeout(() => {
        // Handle scroll-based effects
        updateScrollEffects();
    }, 16); // ~60fps
}

/**
 * Update scroll-based effects
 */
function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;

    // Parallax effect for hero background (if needed)
    const heroBg = document.querySelector('.hero-background');
    if (heroBg) {
        heroBg.style.transform = `translateY(${rate}px)`;
    }
}


/**
 * Show dropdown menu
 */
function showDropdown(menu) {
    menu.style.opacity = '1';
    menu.style.visibility = 'visible';
    menu.style.transform = 'translateY(0)';
}

/**
 * Hide dropdown menu
 */
function hideDropdown(menu) {
    menu.style.opacity = '0';
    menu.style.visibility = 'hidden';
    menu.style.transform = 'translateY(-10px)';
}


/**
 * Clear all form errors
 */
function clearFormErrors() {
    const errorElements = document.querySelectorAll('.field-error');
    errorElements.forEach(element => element.remove());
}

/**
 * Show field-specific error
 */
function showFieldError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }

    // Add error class to field
    field.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #e53e3e;
        font-size: 14px;
        margin-top: 4px;
        font-weight: 500;
    `;

    // Insert after field
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
}

/**
 * Set loading state for button
 */
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="loading-spinner">⟳</span> Sending...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Send Message';
        button.style.opacity = '';
    }
}


/**
 * Google Analytics 4 Tracking Functions
 */

// Track form submissions
function trackFormSubmission(formType, additionalData = {}) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'form_submit', {
            event_category: 'engagement',
            event_label: formType,
            page_location: window.location.href,
            ...additionalData
        });
    }
}

// Track navigation clicks
function trackNavigationClick(href, linkText) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        // Extract destination from href
        let destination = 'unknown';
        if (href.includes('#')) {
            destination = 'same_page_anchor';
        } else if (href.includes('http') && !href.includes(window.location.hostname)) {
            destination = 'external_link';
        } else {
            destination = href.replace(window.location.origin, '').split('/')[1] || 'unknown';
        }

        gtag('event', 'navigation_click', {
            event_category: 'navigation',
            event_label: linkText,
            page_location: window.location.href,
            link_url: href,
            navigation_destination: destination
        });
    }
}

// Track series card clicks
function trackSeriesCardClick(seriesName, cardType = 'main') {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'series_card_click', {
            event_category: 'engagement',
            event_label: seriesName,
            page_location: window.location.href,
            card_type: cardType
        });
    }
}

// Track scroll depth
function trackScrollDepth(percentage) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'scroll_depth', {
            event_category: 'engagement',
            event_label: `${percentage}%`,
            page_location: window.location.href,
            scroll_percentage: percentage
        });
    }
}

/**
 * Utility Functions
 */

/**
 * Debounce function for performance optimization
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Animate elements on scroll
 */
function animateOnScroll() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    animatedElements.forEach(element => {
        if (isInViewport(element)) {
            element.classList.add('animated');
        }
    });
}

// Initialize scroll animations if elements exist
const animatedElements = document.querySelectorAll('.animate-on-scroll');
if (animatedElements.length > 0) {
    window.addEventListener('scroll', debounce(animateOnScroll, 50));
    animateOnScroll(); // Check on load
}

/**
 * Handle window resize
 */
window.addEventListener('resize', debounce(function() {
    initializeMobileMenu();
}, 250));

/**
 * Error handling
 */
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

/**
 * Service Worker registration (for future PWA features)
 */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Register service worker when implemented
        // navigator.serviceWorker.register('/sw.js');
    });
}
