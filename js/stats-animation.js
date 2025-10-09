// Stats Counting Animation
// Animates credential numbers from 0 to their target values on page load

(function() {
    'use strict';

    // EaseOutCubic function for smooth animation
    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    // Parse number from text (handles formats like "20+", "1000+", "5+")
    function parseTargetNumber(text) {
        const match = text.match(/(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    // Format number with plus sign if needed
    function formatNumber(num, originalText) {
        const formatted = num.toLocaleString();
        return originalText.includes('+') ? formatted + '+' : formatted;
    }

    // Animate a single number element
    function animateNumber(element, target, duration = 1500) {
        const startTime = performance.now();
        const startValue = 0;

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutCubic(progress);

            const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);
            element.textContent = formatNumber(currentValue, element.dataset.originalText);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // Ensure final value is exact
                element.textContent = element.dataset.originalText;
            }
        }

        requestAnimationFrame(update);
    }

    // Initialize animations for all credential numbers
    function initStatsAnimation() {
        const numberElements = document.querySelectorAll('.credential-number');

        if (numberElements.length === 0) return;

        // Store original text and set initial state
        numberElements.forEach(element => {
            element.dataset.originalText = element.textContent;
            element.textContent = '0';
        });

        // Use IntersectionObserver to trigger animation when section is visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const credentialItems = entry.target.querySelectorAll('.credential-item');

                    // Animate each item with a slight delay
                    credentialItems.forEach((item, index) => {
                        const numberElement = item.querySelector('.credential-number');
                        if (numberElement && numberElement.dataset.originalText) {
                            const target = parseTargetNumber(numberElement.dataset.originalText);

                            // Stagger animations
                            setTimeout(() => {
                                animateNumber(numberElement, target);
                            }, index * 200); // 200ms delay between each animation
                        }
                    });

                    // Stop observing after animation starts
                    observer.disconnect();
                }
            });
        }, {
            threshold: 0.3, // Trigger when 30% of the section is visible
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before fully in view
        });

        // Observe the credentials section
        const credentialsSection = document.querySelector('.credentials-section');
        if (credentialsSection) {
            observer.observe(credentialsSection);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStatsAnimation);
    } else {
        initStatsAnimation();
    }

    // Also initialize on page load (for cached pages)
    window.addEventListener('load', initStatsAnimation);

})();
