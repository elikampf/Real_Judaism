/**
 * Real Judaism Website - Series Page JavaScript
 * Handles individual podcast series pages with episode loading and Spotify embeds
 */

// Global variables for series page
let seriesPageCurrentSeries = '';
let seriesEpisodes = [];
let allSeriesData = {};
let seriesCurrentPage = 1;
const seriesPageEpisodesPerPage = 9; // 3x3 grid on desktop
let currentFilter = 'all';

/**
 * Initialize series page functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeSeriesPage();
});

/**
 * Initialize the series page
 */
async function initializeSeriesPage() {
    // Extract series name from URL path
    const pathParts = window.location.pathname.split('/');
    seriesPageCurrentSeries = (pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2]).replace('.html', '');
    
    if (!seriesPageCurrentSeries) {
        console.error('No series found in URL');
        showNoEpisodesState();
        return;
    }

    // Load episode data and initialize page
    await loadSeriesData();
    initializeEpisodeFilters();
    initializeScrollToEpisodes();
    initializeLazyLoadingForSeries();
    initializeLoadMoreButton();

    // Initialize tabs only for Shmiras Einayim page
    if (seriesPageCurrentSeries === 'shmiras-einayim') {
        initializeTabNavigation();
    }
}

/**
 * Parse DD-MM-YY date format to Date object
 */
function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const [day, month, year] = dateStr.split('-');
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Load series data from JSON
 */
async function loadSeriesData() {
    try {
        showLoadingState();

        // Load from specific series JSON file
        const seriesFileName = `${seriesPageCurrentSeries}_episodes.json`;

        // Check if we're on a Hebrew page (in hebrew-home directory)
        const isHebrewPage = window.location.pathname.includes('/hebrew-home/');
        const dataPath = isHebrewPage ? '../../data/' : '../data/';

        const response = await fetch(`${dataPath}${seriesFileName}?v=` + Date.now());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const episodeData = await response.json();
        seriesEpisodes = episodeData.episodes || [];

        if (!seriesEpisodes || seriesEpisodes.length === 0) {
            throw new Error(`No episodes found for series "${seriesPageCurrentSeries}"`);
        }
        
        // Sort episodes by date (newest first)
        seriesEpisodes.sort((a, b) => {
            const dateA = parseDate(a.date);
            const dateB = parseDate(b.date);
            return dateB - dateA; // Newest first
        });
        
        // Update page with series data
        updateSeriesInfo();
        displayEpisodes();
        loadRelatedSeries();
        
        console.log(`Loaded ${seriesEpisodes.length} episodes for series: ${seriesPageCurrentSeries}`);

    } catch (error) {
        console.error('Error loading series data:', error);
        showNoEpisodesState();
    }
}

/**
 * Update series information on the page
 */
function updateSeriesInfo() {
    // Update episode count
    const episodeCountElement = document.getElementById('episode-count');
    if (episodeCountElement) {
        episodeCountElement.textContent = seriesEpisodes.length;
        
        // Animate the number
        animateNumber(episodeCountElement, 0, seriesEpisodes.length, 1000);
    }

    // Update page title if needed
    const seriesTitle = formatSeriesName(seriesPageCurrentSeries);
    document.title = `${seriesTitle} - Real Judaism`;
}

/**
 * Display episodes in the grid
 */
function displayEpisodes() {
    const loadingElement = document.getElementById('episodes-loading');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    let filteredEpisodes = filterEpisodes(seriesEpisodes, currentFilter);

    if (filteredEpisodes.length === 0) {
        showNoEpisodesState();
        return;
    }

    // Special handling for Shmiras Einayim with tabs
    if (seriesPageCurrentSeries === 'shmiras-einayim') {
        const season1Container = document.getElementById('season1-episodes-grid');
        const season2Container = document.getElementById('season2-episodes-grid');

        if (!season1Container || !season2Container) return;

        season1Container.innerHTML = '';
        season2Container.innerHTML = '';

        filteredEpisodes.forEach((episode, index) => {
            const season = getEpisodeSeason(episode);
            const episodeCard = createEpisodeCard(episode, index + 1, season);
            if (season === 'Season 1') {
                season1Container.appendChild(episodeCard);
            } else if (season === 'Season 2') {
                season2Container.appendChild(episodeCard);
            }
        });

    } else {
        // Standard display for other series pages
        const container = document.getElementById('episodes-grid');
        if (!container) return;
        container.innerHTML = '';

        const episodesToShow = filteredEpisodes.slice(0, seriesCurrentPage * seriesPageEpisodesPerPage);
        episodesToShow.forEach((episode, index) => {
            const episodeCard = createEpisodeCard(episode, index + 1);
            container.appendChild(episodeCard);
        });
    }

    // Show/hide load more button (only for non-tabbed series)
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn && seriesPageCurrentSeries !== 'shmiras-einayim') {
        const episodesToShow = filteredEpisodes.slice(0, seriesCurrentPage * seriesPageEpisodesPerPage);
        if (episodesToShow.length < filteredEpisodes.length) {
            loadMoreBtn.style.display = 'block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Initialize Spotify embeds
    setTimeout(() => {
        initializeSpotifyEmbeds();
    }, 500);
}

/**
 * Create episode card element
 */
function createEpisodeCard(episode, displayIndex, seasonName = null) {
    const card = document.createElement('div');
    card.className = 'episode-card-series';

    const title = episode.title || 'Untitled Episode';
    const description = episode.description || 'No description available';
    const duration = episode.length || episode.duration || 'N/A';
    const episodeNumber = episode.episode_number || displayIndex;
    const spotifyUrl = episode.spotify_embed_url || '';

    // Remove season from title if it exists, as tabs now show this
    const cleanTitle = title.replace(/^S[12]\sEp\.\s\d+\s-\s/, '');

    card.innerHTML = `
        <div class="episode-spotify-container">
            ${spotifyUrl ? `
                <iframe
                    class="episode-spotify-embed"
                    src="${spotifyUrl}"
                    width="100%"
                    height="232"
                    frameborder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                    loading="lazy">
                </iframe>
            ` : `
                <div class="episode-spotify-fallback">
                    <p class="text-small text-secondary mb-3">Player unavailable</p>
                    <p class="text-small">This episode is not available for embedded playback.</p>
                </div>
            `}
        </div>
        <div class="episode-card-content">
            <div class="episode-card-header">
                <span class="episode-number">Episode ${episodeNumber}</span>
                <div class="episode-metadata">
                    <span class="episode-length">${duration}</span>
                </div>
            </div>
            <h3 class="episode-card-title">${cleanTitle}</h3>
            <p class="episode-card-description">${truncateText(description, 120)}</p>
            <div class="episode-card-footer">
                <div class="episode-duration">
                    <span class="duration-icon">⏱️</span>
                    ${duration}
                </div>
                ${spotifyUrl ? `
                    <a href="${convertEmbedToOpenUrl(spotifyUrl)}" target="_blank" rel="noopener" class="btn-primary episode-spotify-link">
                        Listen on Spotify
                    </a>
                ` : ''}
            </div>
        </div>
    `;

    return card;
}

/**
 * Initialize Spotify embeds with error handling
 */
function initializeSpotifyEmbeds() {
    const embedContainers = document.querySelectorAll('.episode-spotify-container');
    console.log(`Found ${embedContainers.length} Spotify embed containers`);

    embedContainers.forEach((container, index) => {
        const iframe = container.querySelector('.episode-spotify-embed');
        const loading = container.querySelector('.episode-spotify-loading');
        const fallback = container.querySelector('.episode-spotify-fallback');

        console.log(`Container ${index}: iframe=${!!iframe}, loading=${!!loading}, fallback=${!!fallback}`);

        if (!iframe) {
            // No embed available, show fallback
            console.log(`Container ${index}: No iframe found, showing fallback`);
            if (loading) loading.style.display = 'none';
            if (fallback) fallback.style.display = 'flex';
            return;
        }

        console.log(`Container ${index}: iframe src = ${iframe.src}`);

        // Try to show the iframe after a short delay
        // Since CORS might prevent onload/onerror events, we'll use a simple timeout approach
        setTimeout(() => {
            console.log(`Attempting to show iframe for container ${index}`);
            if (loading) loading.style.display = 'none';
            iframe.style.display = 'block';

            // If after another delay the iframe still hasn't loaded properly, show fallback
            setTimeout(() => {
                // Check if iframe content loaded by checking if it has content
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc || iframeDoc.body.innerHTML === '') {
                        console.log(`Iframe ${index} appears empty, showing fallback`);
                        iframe.style.display = 'none';
                        if (fallback) fallback.style.display = 'flex';
                    } else {
                        console.log(`Iframe ${index} appears to have loaded content`);
                    }
                } catch (e) {
                    // Cross-origin iframe, can't check content - assume it's working
                    console.log(`Iframe ${index} loaded (cross-origin, can't verify content)`);
                }
            }, 3000);
        }, 1000);
    });
}

/**
 * Initialize episode filters
 */
function initializeEpisodeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn'); // Adjusted selector for tabs
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(this, filter);
            currentFilter = filter;
            seriesCurrentPage = 1; // Reset to first page
            displayEpisodes();
        });
    });

    // Load more functionality
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            seriesCurrentPage++;
            displayEpisodes();
            
            // Scroll to new content
            setTimeout(() => {
                const newCards = document.querySelectorAll('.episode-card-series');
                if (newCards.length > 0) {
                    const lastCard = newCards[newCards.length - 1];
                    lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        });
    }
}

/**
 * Set active filter button
 */
function setActiveFilter(activeButton, filter) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

/**
 * Filter episodes based on criteria
 */
function filterEpisodes(episodes, filter) {
    switch (filter) {
        case 'chronological':
            // For Dating, Shalom Bayis, Shemiras Einayim: chronological (oldest first)
            if (['dating', 'shalom-bayis', 'shmiras-einayim'].includes(seriesPageCurrentSeries)) {
                return [...episodes].sort((a, b) => {
                    const aNum = parseInt(a.episode_number) || 999;
                    const bNum = parseInt(b.episode_number) || 999;
                    return aNum - bNum;
                });
            }
            // For other series, use date-based chronological
            return [...episodes].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
            
        case 'recent':
            // Show newest first for all series
            return [...episodes].sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateB - dateA;
            });
            
        case 'popular':
            // Sort by episode number (assuming lower numbers are more popular)
            return [...episodes].sort((a, b) => {
                const aNum = parseInt(a.episode_number) || 999;
                const bNum = parseInt(b.episode_number) || 999;
                return aNum - bNum;
            });
            
        case 'all':
        default:
            // Apply series-specific default ordering
            if (['dating', 'shalom-bayis', 'shmiras-einayim'].includes(seriesPageCurrentSeries)) {
                // Chronological (oldest first)
                return [...episodes].sort((a, b) => {
                    const aNum = parseInt(a.episode_number) || 999;
                    const bNum = parseInt(b.episode_number) || 999;
                    return aNum - bNum;
                });
            } else if (['shmiras-halashon', 'shabbos', 'mesilas-yesharim'].includes(seriesPageCurrentSeries)) {
                // Reverse chronological (newest first)
                return [...episodes].sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });
            }
            return episodes;
    }
}

/**
 * Initialize tab navigation for Shmiras Einayim page
 */
function initializeTabNavigation() {
    const tabs = document.querySelectorAll('.tab-link');
    const panes = document.querySelectorAll('.tab-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetPaneId = tab.getAttribute('data-tab');
            
            // Update tabs
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update panes
            panes.forEach(pane => {
                if (pane.id === targetPaneId) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
}

/**
 * Load related series
 */
async function loadRelatedSeries() {
    const container = document.getElementById('related-series');
    if (!container) return;

    // Define related series based on current series
    const relatedSeriesMap = {
        'dating': ['shalom-bayis', 'mesilas-yesharim', 'shmiras-einayim'],
        'shalom-bayis': ['dating', 'mesilas-yesharim', 'shmiras-halashon'],
        'shmiras-einayim': ['mesilas-yesharim', 'shmiras-halashon', 'shabbos'],
        'shmiras-halashon': ['mesilas-yesharim', 'shabbos', 'shalom-bayis'],
        'shabbos': ['mesilas-yesharim', 'shmiras-halashon', 'shmiras-einayim'],
        'mesilas-yesharim': ['shabbos', 'shmiras-halashon', 'shalom-bayis']
    };

    const relatedSeries = relatedSeriesMap[seriesPageCurrentSeries] || ['dating', 'shalom-bayis', 'mesilas-yesharim'];
    container.innerHTML = '';

    for (const seriesName of relatedSeries.slice(0, 3)) {
        try {
            const seriesFileName = `${seriesName}_episodes.json`;

            // Check if we're on a Hebrew page (in hebrew-home directory)
            const isHebrewPage = window.location.pathname.includes('/hebrew-home/');
            const dataPath = isHebrewPage ? '../../data/' : '../data/';

            const response = await fetch(`${dataPath}${seriesFileName}?v=` + Date.now());
            if (response.ok) {
                const seriesData = await response.json();
                const episodeCount = seriesData.episodes ? seriesData.episodes.length : 0;
                const relatedCard = createRelatedSeriesCard(seriesName, { episodes: [], episode_count: episodeCount });
                container.appendChild(relatedCard);
            }
        } catch (error) {
            console.warn(`Could not load related series ${seriesName}:`, error);
        }
    }

    // Initialize lazy loading after adding cards
    if (typeof initializeLazyLoading === 'function') {
        console.log('Initializing lazy loading for related series...');
        initializeLazyLoading();
    } else {
        console.warn('initializeLazyLoading function not found');
        // Fallback: manually load images
        const lazyImages = container.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            const src = img.getAttribute('data-src');
            if (src) {
                img.src = src;
                img.classList.add('loaded');
                img.classList.remove('lazy-loading');
                img.style.opacity = '1';
            }
        });
    }
}

/**
 * Create related series card
 */
function createRelatedSeriesCard(seriesName, seriesInfo) {
    const card = document.createElement('a');
    card.className = 'series-card-compact';
    card.href = `/series/${seriesName}`;

    const episodeCount = seriesInfo.episode_count || seriesInfo.episodes.length;
    const description = generateSeriesDescription(seriesName);
    const displayName = formatSeriesName(seriesName);

    card.innerHTML = `
        <div class="series-card-compact-image">
            <img data-src="../images/${getSeriesImage(seriesName)}"
                 alt="${displayName} Series"
                 class="lazy-loading"
                 loading="lazy">
        </div>
        <div class="series-card-compact-content">
            <div>
                <h3 class="series-card-compact-title">${displayName}</h3>
                <p class="series-card-compact-description">${description}</p>
            </div>
            <div class="series-card-compact-meta">
                <span class="series-card-compact-episodes">${episodeCount} episodes</span>
                <span class="series-card-compact-category">Series</span>
            </div>
        </div>
    `;

    return card;
}

/**
 * Initialize scroll to episodes functionality
 */
function initializeScrollToEpisodes() {
    // Make scrollToEpisodes available globally
    window.scrollToEpisodes = function() {
        const episodesSection = document.getElementById('episodes');
        if (episodesSection) {
            episodesSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    };

    // Make scrollToFirstEpisode available globally for Dating series
    window.scrollToFirstEpisode = function() {
        const episodesSection = document.getElementById('episodes');
        if (episodesSection) {
            episodesSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // After scrolling, highlight the first episode
            setTimeout(() => {
                const firstEpisodeCard = document.querySelector('.episode-card-series');
                if (firstEpisodeCard) {
                    firstEpisodeCard.style.transform = 'scale(1.02)';
                    firstEpisodeCard.style.boxShadow = '0 8px 25px rgba(55, 65, 81, 0.3)';
                    firstEpisodeCard.style.border = '2px solid var(--color-primary)';
                    
                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        firstEpisodeCard.style.transform = '';
                        firstEpisodeCard.style.boxShadow = '';
                        firstEpisodeCard.style.border = '';
                    }, 3000);
                }
            }, 500);
        }
    };
}

/**
 * Initialize lazy loading for series page images
 */
function initializeLazyLoadingForSeries() {
    // Use the existing lazy loading functionality from main.js
    if (typeof initializeLazyLoading === 'function') {
        initializeLazyLoading();
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingElement = document.getElementById('episodes-loading');
    const gridElement = document.getElementById('episodes-grid');
    const noEpisodesElement = document.getElementById('no-episodes');
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (gridElement) gridElement.innerHTML = '';
    if (noEpisodesElement) noEpisodesElement.style.display = 'none';
}

/**
 * Show no episodes state
 */
function showNoEpisodesState() {
    const loadingElement = document.getElementById('episodes-loading');
    const gridElement = document.getElementById('episodes-grid');
    const noEpisodesElement = document.getElementById('no-episodes');
    const loadMoreContainer = document.getElementById('load-more-container');
    
    if (loadingElement) loadingElement.style.display = 'none';
    if (gridElement) gridElement.innerHTML = '';
    if (noEpisodesElement) noEpisodesElement.style.display = 'block';
    if (loadMoreContainer) loadMoreContainer.style.display = 'none';
}

/**
 * Utility Functions
 */

/**
 * Format series name for display
 */
function formatSeriesName(seriesName) {
    return seriesName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Generate series description
 */
function generateSeriesDescription(seriesName) {
    const descriptions = {
        'dating': 'Insights and guidance on Jewish dating, relationships, and finding your bashert.',
        'mesilas-yesharim': 'Exploring the path of the righteous through the teachings of the Mesilas Yesharim.',
        'shabbos': 'Deep dive into Shabbos laws, customs, and spiritual significance.',
        'shalom-bayis': 'Building and maintaining peace and harmony in the Jewish home.',
        'shmiras-halashon': 'Guarding your speech and the power of words in Jewish thought.',
        'shmiras-einayim': 'Guarding the eyes and maintaining purity in vision and thought.',
    };

    return descriptions[seriesName] || 'A collection of teachings and insights on this important topic.';
}

/**
 * Get series image filename
 */
function getSeriesImage(seriesName) {
    const imageMap = {
        'dating': 'dating.png',
        'mesilas-yesharim': 'mesilas-yesharim.png',
        'shabbos': 'shabbos.png',
        'shalom-bayis': 'shalom-bayis.png',
        'shmiras-halashon': 'shmiras-halashon.png',
        'shmiras-einayim': 'shmiras-einayim.png',
    };

    return imageMap[seriesName] || 'images/profile_2.jpg';
}

/**
 * Convert Spotify embed URL to open URL
 */
function convertEmbedToOpenUrl(embedUrl) {
    if (!embedUrl) return '#';
    
    // Convert embed URL to open URL
    return embedUrl.replace('/embed/', '/').replace('?utm_source=generator', '');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    if (!dateString) return 'Date not available';

    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

/**
 * Animate number counting up
 */
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const currentNumber = Math.floor(start + (end - start) * progress);
        element.textContent = currentNumber;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

/**
 * Get episode season based on date
 */
function getEpisodeSeason(episode) {
    if (!episode.date) return null;

    // Check title first for explicit season "S1" or "S2"
    if (episode.title && episode.title.startsWith('S1')) return 'Season 1';
    if (episode.title && episode.title.startsWith('S2')) return 'Season 2';

    // Fallback to date parsing
    const dateStr = episode.date;
    const year = parseInt(dateStr.split('-')[2]);

    if (year >= 25 || year === 2025) {
        return 'Season 2';
    } else if (year <= 22 || year === 2021 || year === 2022) {
        return 'Season 1';
    }

    return null;
}

/**
 * Create season header element
 */
function createSeasonHeader(seasonName) {
    const headerDiv = document.createElement('div');
    headerDiv.className = 'season-header';

    // Add episode count for this season if possible
    const episodeCount = seriesEpisodes.filter(ep => getEpisodeSeason(ep) === seasonName).length;
    const countText = episodeCount > 0 ? ` (${episodeCount} episodes)` : '';

    headerDiv.innerHTML = `
        <div class="season-header-content">
            <h3 class="season-title">${seasonName}${countText}</h3>
            <div class="season-divider"></div>
        </div>
    `;

    return headerDiv;
}

/**
 * Initialize load more button functionality
 */
function initializeLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function() {
            seriesCurrentPage++;
            displayEpisodes();
        });
    }
}

// Export functions for global access
window.scrollToEpisodes = function() {
    const episodesSection = document.getElementById('episodes');
    if (episodesSection) {
        episodesSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
};
