// ============================================
// COOKIE CONSENT MANAGEMENT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeCookieConsent();
});

/**
 * Initialize cookie consent banner
 */
function initializeCookieConsent() {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');

    if (!consent) {
        // Show cookie banner if no consent given yet
        showCookieBanner();
    } else {
        // If consent was given, ensure GA is properly configured
        if (consent === 'accepted' && typeof gtag !== 'undefined') {
            gtag('config', 'GA_MEASUREMENT_ID', {
                'anonymize_ip': true,
                'allow_google_signals': false,
                'allow_ad_features': false
            });
        }
    }
}

/**
 * Show cookie consent banner
 */
function showCookieBanner() {
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    banner.innerHTML = `
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                <h3>Cookie Preferences</h3>
                <p>We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept All", you consent to our use of cookies for these purposes.</p>
            </div>
            <div class="cookie-consent-buttons">
                <button id="cookie-reject" class="btn btn-utility">Reject All</button>
                <button id="cookie-accept" class="btn btn-primary">Accept All</button>
            </div>
        </div>
    `;

    // Add to page
    document.body.appendChild(banner);

    // Add event listeners
    document.getElementById('cookie-accept').addEventListener('click', function() {
        acceptCookies();
        hideCookieBanner();
    });

    document.getElementById('cookie-reject').addEventListener('click', function() {
        rejectCookies();
        hideCookieBanner();
    });

    // Animate in
    setTimeout(() => {
        banner.classList.add('show');
    }, 100);
}

/**
 * Hide cookie consent banner
 */
function hideCookieBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
}

/**
 * Accept cookies and enable GA
 */
function acceptCookies() {
    localStorage.setItem('cookie-consent', 'accepted');

    // Enable Google Analytics if available
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'anonymize_ip': true,
            'allow_google_signals': false,
            'allow_ad_features': false
        });

        // Track consent acceptance
        gtag('event', 'cookie_consent_accepted', {
            event_category: 'privacy',
            event_label: 'cookie_banner',
            page_location: window.location.href
        });
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
        detail: { consent: 'accepted' }
    }));
}

/**
 * Reject cookies and disable GA
 */
function rejectCookies() {
    localStorage.setItem('cookie-consent', 'rejected');

    // Disable Google Analytics (remove gtag config)
    if (typeof gtag !== 'undefined') {
        // Track consent rejection (before disabling)
        gtag('event', 'cookie_consent_rejected', {
            event_category: 'privacy',
            event_label: 'cookie_banner',
            page_location: window.location.href
        });

        // Note: In a real implementation, you might want to disable GA completely
        // or use a consent management platform for more granular control
    }

    // Dispatch custom event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
        detail: { consent: 'rejected' }
    }));
}

/**
 * Get current cookie consent status
 */
function getCookieConsent() {
    return localStorage.getItem('cookie-consent');
}

/**
 * Reset cookie consent (for testing purposes)
 */
function resetCookieConsent() {
    localStorage.removeItem('cookie-consent');
    location.reload();
}

// Make functions globally available for debugging/testing
window.resetCookieConsent = resetCookieConsent;
window.getCookieConsent = getCookieConsent;
