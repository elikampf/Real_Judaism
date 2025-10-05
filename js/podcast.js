// ============================================
// PODCAST PAGE FUNCTIONALITY
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize search and filter functionality
    initializeSearch();
    initializeFilters();

    // Initialize accordion functionality
    initializeAccordion();

    // Initialize lazy loading for images
    initializeLazyLoading();
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const seriesCards = document.querySelectorAll('.series-card');
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (!searchInput) return;

    // Debounced search to improve performance
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value.toLowerCase());
        }, 300);
    });

    function performSearch(query) {
        let visibleCount = 0;

        // Search through cards
        seriesCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-description').textContent.toLowerCase();

            if (title.includes(query) || description.includes(query)) {
                // Show card with fade-in animation
                card.style.display = '';
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';

                // Force reflow
                card.offsetHeight;

                // Animate in
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';

                visibleCount++;
            } else {
                // Hide card with fade-out animation
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '0';
                card.style.transform = 'translateY(-20px)';

                // Hide after animation completes
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Search through accordions
        accordionItems.forEach(accordion => {
            const title = accordion.querySelector('.accordion-title').textContent.toLowerCase();
            const hook = accordion.querySelector('.accordion-hook').textContent.toLowerCase();
            const description = accordion.querySelector('.accordion-description')?.textContent.toLowerCase() || '';

            if (title.includes(query) || hook.includes(query) || description.includes(query)) {
                // Show accordion with fade-in animation
                accordion.style.display = '';
                accordion.style.opacity = '0';
                accordion.style.transform = 'translateY(20px)';

                // Force reflow
                accordion.offsetHeight;

                // Animate in
                accordion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                accordion.style.opacity = '1';
                accordion.style.transform = 'translateY(0)';

                visibleCount++;
            } else {
                // Hide accordion with fade-out animation
                accordion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                accordion.style.opacity = '0';
                accordion.style.transform = 'translateY(-20px)';

                // Hide after animation completes
                setTimeout(() => {
                    accordion.style.display = 'none';
                }, 300);
            }
        });

        // Show/hide no results message
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = visibleCount > 0 ? 'none' : 'block';
        }
    }
}

// ============================================
// FILTER FUNCTIONALITY
// ============================================

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const seriesCards = document.querySelectorAll('.series-card');
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (!filterButtons.length) return;

    // Add count badges to filter buttons
    updateFilterCounts(filterButtons, seriesCards, accordionItems);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');

            // Update active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Apply filter with smooth transitions
            applyFilter(filterValue, seriesCards, accordionItems);
        });
    });
}

function updateFilterCounts(filterButtons, seriesCards, accordionItems) {
    // Count both cards and accordions by category
    const counts = {};

    // Count cards
    seriesCards.forEach(card => {
        const category = card.getAttribute('data-category') || 'all';
        counts[category] = (counts[category] || 0) + 1;
    });

    // Count accordions (they should match cards)
    accordionItems.forEach(item => {
        const category = item.getAttribute('data-category') || 'all';
        counts[category] = (counts[category] || 0) + 1;
    });

    // Update button text with counts
    filterButtons.forEach(button => {
        const filterValue = button.getAttribute('data-filter');
        let count = 0;

        if (filterValue === 'all') {
            count = seriesCards.length; // Use cards as the primary count
        } else {
            count = counts[filterValue] || 0;
        }

        // Update button text to include count
        const originalText = button.textContent.replace(/\s*\(\d+\)$/, ''); // Remove existing count
        button.textContent = `${originalText} (${count})`;
    });
}

function applyFilter(filterValue, cards, accordions) {
    let visibleCount = 0;

    // Filter cards
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (filterValue === 'all' || cardCategory === filterValue) {
            // Show card with fade-in animation
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';

            // Force reflow
            card.offsetHeight;

            // Animate in
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';

            visibleCount++;
        } else {
            // Hide card with fade-out animation
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';

            // Hide after animation completes
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });

    // Filter accordions (same logic as cards)
    accordions.forEach(accordion => {
        const accordionCategory = accordion.getAttribute('data-category');

        if (filterValue === 'all' || accordionCategory === filterValue) {
            // Show accordion with fade-in animation
            accordion.style.display = '';
            accordion.style.opacity = '0';
            accordion.style.transform = 'translateY(20px)';

            // Force reflow
            accordion.offsetHeight;

            // Animate in
            accordion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            accordion.style.opacity = '1';
            accordion.style.transform = 'translateY(0)';

            visibleCount++;
        } else {
            // Hide accordion with fade-out animation
            accordion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            accordion.style.opacity = '0';
            accordion.style.transform = 'translateY(-20px)';

            // Hide after animation completes
            setTimeout(() => {
                accordion.style.display = 'none';
            }, 300);
        }
    });

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = visibleCount > 0 ? 'none' : 'block';
    }
}

// ============================================
// LAZY LOADING FUNCTIONALITY
// ============================================

function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy-loading');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src || img.src;
            img.classList.remove('lazy-loading');
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showAllPodcasts() {
    // Reset search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
    }

    // Reset filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    const allButton = document.querySelector('.filter-btn[data-filter="all"]');
    if (allButton) {
        allButton.classList.add('active');
    }

    // Show all series cards with animation
    const seriesCards = document.querySelectorAll('.series-card');
    seriesCards.forEach(card => {
        card.style.display = '';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';

        // Force reflow
        card.offsetHeight;

        // Animate in
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    });

    // Show all accordion items with animation
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(accordion => {
        accordion.style.display = '';
        accordion.style.opacity = '0';
        accordion.style.transform = 'translateY(20px)';

        // Force reflow
        accordion.offsetHeight;

        // Animate in
        accordion.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        accordion.style.opacity = '1';
        accordion.style.transform = 'translateY(0)';
    });

    // Hide no results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = 'none';
    }
}

// ============================================
// GOOGLE ANALYTICS 4 TRACKING
// ============================================

function trackPodcastInteraction(action, seriesName, platform = null, additionalData = {}) {
    // Only track if GA4 is available and user has consented
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        const eventData = {
            event_category: 'podcast_engagement',
            event_label: seriesName,
            page_location: window.location.href,
            ...additionalData
        };

        if (platform) {
            eventData.custom_parameter_1 = platform;
        }

        gtag('event', action, eventData);
    }
}

// Track platform link clicks
function trackPlatformClick(e) {
    const link = e.target.closest('.platform-icon');
    if (!link) return;

    const card = link.closest('.series-card');
    if (!card) return;

    const seriesName = card.querySelector('.card-title').textContent.trim();

    // Extract platform from link URL
    let platform = 'unknown';
    if (link.href.includes('spotify')) platform = 'spotify';
    else if (link.href.includes('apple')) platform = 'apple_podcasts';
    else if (link.href.includes('youtube')) platform = 'youtube';

    trackPodcastInteraction('podcast_platform_click', seriesName, platform, {
        link_url: link.href,
        link_text: link.getAttribute('aria-label') || 'platform link'
    });
}

// Track "Listen Now" button clicks
function trackListenNowClick(e) {
    const button = e.target.closest('.btn-primary, .btn-quick-listen');
    if (!button) return;

    let seriesName = '';
    let episodeCount = 'unknown';

    // Check if it's from a card
    const card = button.closest('.series-card');
    if (card) {
        seriesName = card.querySelector('.card-title').textContent.trim();
        episodeCount = card.querySelector('.episode-count')?.textContent || 'unknown';
    }

    // Check if it's from an accordion
    const accordion = button.closest('.accordion-item');
    if (accordion) {
        seriesName = accordion.querySelector('.accordion-title').textContent.trim();
        episodeCount = accordion.querySelector('.accordion-episodes')?.textContent || 'unknown';
    }

    if (seriesName) {
        trackPodcastInteraction('podcast_listen_now_click', seriesName, null, {
            episode_count: episodeCount,
            button_text: button.textContent.trim()
        });
    }
}

// Track search interactions
function trackSearchInteraction(query, resultsCount) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'podcast_search', {
            event_category: 'podcast_engagement',
            search_term: query,
            results_count: resultsCount,
            page_location: window.location.href
        });
    }
}

// Track filter interactions
function trackFilterInteraction(filterType) {
    const consent = localStorage.getItem('cookie-consent');
    if (typeof gtag !== 'undefined' && consent === 'accepted') {
        gtag('event', 'podcast_filter', {
            event_category: 'podcast_engagement',
            filter_type: filterType,
            page_location: window.location.href
        });
    }
}

// Enhanced click tracking with delegation
document.addEventListener('click', function(e) {
    // Track platform link clicks
    if (e.target.closest('.platform-icon')) {
        trackPlatformClick(e);
    }

    // Track listen now button clicks
    if (e.target.closest('.btn-primary')) {
        trackListenNowClick(e);
    }

    // Track filter button clicks
    if (e.target.closest('.filter-btn')) {
        const filterBtn = e.target.closest('.filter-btn');
        const filterType = filterBtn.getAttribute('data-filter');
        trackFilterInteraction(filterType);
    }
});

// ============================================
// ACCORDION FUNCTIONALITY
// ============================================

function initializeAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.closest('.accordion-item');
            const content = item.querySelector('.accordion-content');
            const isExpanded = item.hasAttribute('aria-expanded');

            // Close all other accordions
            const allItems = document.querySelectorAll('.accordion-item');
            allItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.removeAttribute('aria-expanded');
                    const otherContent = otherItem.querySelector('.accordion-content');
                    otherContent.style.maxHeight = '0';
                }
            });

            // Toggle current accordion
            if (isExpanded) {
                item.removeAttribute('aria-expanded');
                content.style.maxHeight = '0';
            } else {
                item.setAttribute('aria-expanded', 'true');
                // First set height to auto to get the natural height, then animate
                content.style.maxHeight = 'none';
                const height = content.scrollHeight;
                content.style.maxHeight = '0';

                // Force reflow
                content.offsetHeight;

                // Now animate to the calculated height
                content.style.maxHeight = height + 'px';
            }
        });
    });
}

// ============================================
// PERFORMANCE OPTIMIZATIONS
// ============================================

// Preload critical images
function preloadCriticalImages() {
    const criticalImages = [
        'images/profile.png',
        'images/dating.png',
        'images/shalom-bayis.png'
    ];

    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Preload on page load
preloadCriticalImages();

