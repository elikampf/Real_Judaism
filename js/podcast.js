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
        let hasVisibleItems = false;

        accordionItems.forEach(item => {
            const title = item.querySelector('.accordion-title').textContent.toLowerCase();
            const hook = item.querySelector('.accordion-hook').textContent.toLowerCase();
            const description = item.querySelector('.accordion-description p')?.textContent.toLowerCase() || '';

            if (title.includes(query) || hook.includes(query) || description.includes(query)) {
                item.style.display = '';
                hasVisibleItems = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Show/hide no results message
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = hasVisibleItems ? 'none' : 'block';
        }
    }
}

// ============================================
// FILTER FUNCTIONALITY
// ============================================

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (!filterButtons.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = this.getAttribute('data-filter');

            // Update active button state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Apply filter
            applyFilter(filterValue, accordionItems);
        });
    });
}

function applyFilter(filterValue, items) {
    let hasVisibleItems = false;

    items.forEach(item => {
        const itemCategory = item.getAttribute('data-category');

        if (filterValue === 'all' || itemCategory === filterValue) {
            item.style.display = '';
            hasVisibleItems = true;
        } else {
            item.style.display = 'none';
        }
    });

    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (noResults) {
        noResults.style.display = hasVisibleItems ? 'none' : 'block';
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

    // Show all accordion items
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
        item.style.display = '';
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
    const link = e.target.closest('.platform-link');
    if (!link) return;

    const item = link.closest('.accordion-item');
    if (!item) return;

    const seriesName = item.querySelector('.accordion-title').textContent.trim();

    // Extract platform from link URL
    let platform = 'unknown';
    if (link.href.includes('spotify')) platform = 'spotify';
    else if (link.href.includes('apple')) platform = 'apple_podcasts';
    else if (link.href.includes('youtube')) platform = 'youtube';

    trackPodcastInteraction('podcast_platform_click', seriesName, platform, {
        link_url: link.href,
        link_text: link.textContent.trim()
    });
}

// Track "Listen Now" button clicks
function trackListenNowClick(e) {
    const button = e.target.closest('.btn-quick-listen');
    if (!button) return;

    const item = button.closest('.accordion-item');
    if (!item) return;

    const seriesName = item.querySelector('.accordion-title').textContent.trim();
    const episodeCount = item.querySelector('.accordion-episodes')?.textContent || 'unknown';

    trackPodcastInteraction('podcast_listen_now_click', seriesName, null, {
        episode_count: episodeCount,
        button_text: button.textContent.trim()
    });
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
    if (e.target.closest('.platform-link')) {
        trackPlatformClick(e);
    }

    // Track listen now button clicks
    if (e.target.closest('.btn-quick-listen')) {
        trackListenNowClick(e);
    }

    // Track filter button clicks
    if (e.target.closest('.filter-btn')) {
        const filterBtn = e.target.closest('.filter-btn');
        const filterType = filterBtn.getAttribute('data-filter');
        trackFilterInteraction(filterType);
    }
});

// Enhanced search tracking
function initializeSearch() {
    const searchInput = document.getElementById('search-input');
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (!searchInput) return;

    let lastQuery = '';
    let searchTimeout;

    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();
            if (query !== lastQuery) {
                performSearch(query);
                lastQuery = query;
            }
        }, 300);
    });

    function performSearch(query) {
        let visibleCount = 0;

        accordionItems.forEach(item => {
            const title = item.querySelector('.accordion-title').textContent.toLowerCase();
            const hook = item.querySelector('.accordion-hook').textContent.toLowerCase();
            const description = item.querySelector('.accordion-description p')?.textContent.toLowerCase() || '';

            if (title.includes(query) || hook.includes(query) || description.includes(query)) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // Track search if query is not empty
        if (query.length > 0) {
            trackSearchInteraction(query, visibleCount);
        }

        // Show/hide no results message
        const noResults = document.getElementById('no-results');
        if (noResults) {
            noResults.style.display = visibleCount > 0 ? 'none' : 'block';
        }
    }
}

// ============================================
// RESPONSIVE BEHAVIOR
// ============================================

function handleResponsiveLayout() {
    const isMobile = window.innerWidth < 768;
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        if (isMobile) {
            // Adjust item layout for mobile
            item.style.marginBottom = '1rem';
        } else {
            item.style.marginBottom = '';
        }
    });
}

// Handle responsive layout on window resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(handleResponsiveLayout, 250);
});

// Initialize responsive layout on load
handleResponsiveLayout();

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

function enhanceAccessibility() {
    // Add keyboard navigation support
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                performSearch('');
                this.blur();
            }
        });
    }

    // Add ARIA labels and roles where needed
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        const filterType = button.getAttribute('data-filter');
        button.setAttribute('aria-pressed', button.classList.contains('active'));
        button.setAttribute('aria-label', `Filter podcasts by ${filterType}`);
    });
}

// Initialize accessibility enhancements
enhanceAccessibility();

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

