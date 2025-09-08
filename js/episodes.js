/**
 * Real Judaism Website - Episodes JavaScript
 * Handles loading and displaying podcast episodes from JSON data
 */

// Global variables
let allEpisodes = [];
let episodeData = null;
let currentSeries = 'all';
let episodesPerPage = 12; // Show 12 episodes initially
let currentPage = 1;

/**
 * Initialize episodes functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a page that should display episodes
    const episodesGrid = document.getElementById('episodesGrid');
    const seriesGrid = document.getElementById('seriesGrid');

    if (episodesGrid || seriesGrid) {
        loadEpisodeData();
        initializeSeriesFilters();
        initializeHomepageEpisodeCounts();
    }
});

/**
 * Load episode data from JSON file
 */
async function loadEpisodeData() {
    try {
        // Determine the correct path to episodes.json based on current location
        const currentPath = window.location.pathname;
        let dataPath;

        if (currentPath.includes('/hebrew-home/')) {
            dataPath = '../data/episodes.json';
        } else if (currentPath.includes('/series/') || currentPath.includes('/podcast.html')) {
            dataPath = '../data/episodes.json';
        } else if (currentPath === '/' || currentPath.endsWith('/index.html')) {
            dataPath = 'data/episodes.json';
        } else {
            dataPath = 'data/episodes.json';
        }

        console.log('Loading episodes from:', dataPath);
        console.log('Current path:', currentPath);

        const response = await fetch(dataPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        episodeData = await response.json();
        allEpisodes = episodeData.episodes || [];

        console.log(`✅ Loaded ${allEpisodes.length} episodes from ${episodeData.series_count || Object.keys(episodeData.series || {}).length} series`);

        // Display episodes and series
        displayEpisodes(allEpisodes);
        displaySeries();

        // Update episode counts on the page
        updateEpisodeCounts();

        // Update homepage series card images
        updateHomepageImages();

    } catch (error) {
        console.error('❌ Error loading episode data:', error);
        console.error('Error details:', error.message);
        displayError('Failed to load episode data. Please try again later.');
    }
}

/**
 * Display episodes in the grid with pagination
 */
function displayEpisodes(episodes, resetPage = true) {
    // Try different container IDs
    let container = document.getElementById('episodesGrid') ||
                   document.getElementById('episodes-grid');
    if (!container) return;

    if (resetPage) {
        currentPage = 1;
    }

    // Clear container if resetting page
    if (resetPage) {
        container.innerHTML = '';
    }

    if (episodes.length === 0) {
        container.innerHTML = '<p class="no-episodes">No episodes found for this series.</p>';
        return;
    }

    // Calculate episodes to show
    const startIndex = 0;
    const endIndex = currentPage * episodesPerPage;
    const episodesToShow = episodes.slice(startIndex, endIndex);

    // Only add new episodes if not resetting
    const startFrom = resetPage ? 0 : (currentPage - 1) * episodesPerPage;

    episodesToShow.slice(startFrom).forEach((episode, index) => {
        const episodeCard = createEpisodeCard(episode, startFrom + index + 1);
        container.appendChild(episodeCard);
    });

    // Add Load More button if there are more episodes
    if (episodes.length > endIndex) {
        addLoadMoreButton(episodes.length - endIndex);
    } else if (document.querySelector('.load-more-btn')) {
        // Remove load more button if no more episodes
        document.querySelector('.load-more-btn').remove();
    }
}

/**
 * Create episode card element
 */
function createEpisodeCard(episode, episodeNumber) {
    const card = document.createElement('div');
    card.className = 'episode-card';

    const title = episode.title || 'Untitled Episode';
    const description = episode.description || 'No description available';
    const date = formatDate(episode.date);
    const duration = episode.length || episode.duration || 'N/A';
    const series = episode.series || 'General';
    const spotifyUrl = episode.spotify_embed_url || '#';

    card.innerHTML = `
        <div class="episode-header">
            <span class="episode-number">Episode ${episode.episode_number || episodeNumber}</span>
            <span class="episode-date">${date}</span>
        </div>
        <h3 class="episode-title">${title}</h3>
        <p class="episode-description">${truncateText(description, 150)}</p>
        <div class="episode-footer">
            <div class="episode-duration">
                <span class="duration-icon">⏱️</span>
                ${duration}
            </div>
            <button class="episode-play-btn" onclick="playEpisode('${spotifyUrl}')">
                <span class="play-icon">▶️</span>
                Play Episode
            </button>
        </div>
        <div class="episode-series">
            <span class="badge badge-primary">${series}</span>
        </div>
    `;

    return card;
}

/**
 * Display series in the series grid
 */
function displaySeries() {
    const container = document.getElementById('seriesGrid');
    if (!container || !episodeData) return;

    container.innerHTML = '';

    Object.keys(episodeData.series).forEach(seriesName => {
        const seriesInfo = episodeData.series[seriesName];
        const seriesCard = createSeriesCard(seriesName, seriesInfo.episodes);
        container.appendChild(seriesCard);
    });
}

/**
 * Create series card element
 */
function createSeriesCard(seriesName, episodes) {
    const card = document.createElement('div');
    card.className = 'series-card';
    card.onclick = () => filterBySeries(seriesName);

    const episodeCount = episodes.length;
    const latestEpisode = episodes.length > 0 ? episodes[0] : null;
    const description = generateSeriesDescription(seriesName);

    card.innerHTML = `
        <div class="series-image">
            <img src="${getSeriesImage(seriesName)}" alt="${seriesName}" loading="lazy">
            <div class="series-overlay">
                <button class="series-play-btn">
                    <span class="series-play-icon">▶️</span>
                </button>
            </div>
        </div>
        <div class="series-content">
            <h3 class="series-title">${seriesName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p class="series-description">${description}</p>
            <div class="series-stats">
                <div class="series-episodes">
                    <span class="episodes-icon">🎧</span>
                    ${episodeCount} episodes
                </div>
            </div>
        </div>
    `;

    return card;
}

/**
 * Initialize series filters
 */
function initializeSeriesFilters() {
    // Add filter buttons if they don't exist
    const seriesSection = document.querySelector('.series-section');
    if (seriesSection && !document.querySelector('.series-filters') && episodeData) {
        const filterContainer = document.createElement('div');
        filterContainer.className = 'series-filters';
        let filterButtons = `<button class="filter-btn active" onclick="filterBySeries('all')">All Series</button>`;

        Object.keys(episodeData.series).forEach(seriesName => {
            const displayName = seriesName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            filterButtons += `<button class="filter-btn" onclick="filterBySeries('${seriesName}')">${displayName}</button>`;
        });

        filterContainer.innerHTML = filterButtons;
        seriesSection.insertBefore(filterContainer, seriesSection.querySelector('.container'));
    }
}

/**
 * Initialize homepage episode counts
 */
function initializeHomepageEpisodeCounts() {
    // Only run on homepage
    if (!document.querySelector('.series-showcase')) return;

    if (!episodeData) {
        // Wait for episode data to load
        setTimeout(initializeHomepageEpisodeCounts, 100);
        return;
    }

    updateHomepageEpisodeCounts();
}

/**
 * Update episode counts on homepage series cards
 */
function updateHomepageEpisodeCounts() {
    if (!episodeData) return;

    const seriesCards = document.querySelectorAll('.series-card-main');
    seriesCards.forEach(card => {
        const seriesName = getSeriesNameFromCard(card);
        if (seriesName && episodeData.series[seriesName]) {
            const episodeCount = episodeData.series[seriesName].episode_count || episodeData.series[seriesName].episodes.length;
            addEpisodeCountToCard(card, episodeCount);
        }
    });
}

/**
 * Get series name from card href
 */
function getSeriesNameFromCard(card) {
    const link = card.querySelector('a');
    if (link) {
        const href = link.getAttribute('href');
        if (href) {
            // Extract series name from href like /series/dating
            const match = href.match(/\/series\/(.+)/);
            return match ? match[1] : null;
        }
    }
    return null;
}

/**
 * Add episode count to series card
 */
function addEpisodeCountToCard(card, count) {
    // Remove existing episode count if present
    const existingCount = card.querySelector('.episode-count');
    if (existingCount) {
        existingCount.remove();
    }

    // Create episode count element
    const countElement = document.createElement('div');
    countElement.className = 'episode-count';
    countElement.innerHTML = `
        <span class="episode-count-icon">🎧</span>
        <span class="episode-count-text">${count} Episodes</span>
    `;

    // Find the card content and append the count
    const cardContent = card.querySelector('.card-content-main');
    if (cardContent) {
        cardContent.appendChild(countElement);

        // Add show class after a small delay for smooth animation
        setTimeout(() => {
            countElement.classList.add('show');
        }, 100);
    }
}

/**
 * Add Load More button
 */
function addLoadMoreButton(remainingCount) {
    // Remove existing load more button
    const existingButton = document.querySelector('.load-more-btn');
    if (existingButton) {
        existingButton.remove();
    }

    // Try different container IDs
    const container = document.getElementById('episodesGrid') ||
                     document.getElementById('episodes-grid');
    if (!container) return;

    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    loadMoreContainer.innerHTML = `
        <button class="load-more-btn" onclick="loadMoreEpisodes()">
            Load More Episodes (${remainingCount} remaining)
        </button>
    `;

    container.appendChild(loadMoreContainer);
}

/**
 * Load more episodes
 */
function loadMoreEpisodes() {
    currentPage++;

    let episodesToLoad;
    if (currentSeries === 'all') {
        episodesToLoad = allEpisodes;
    } else {
        episodesToLoad = episodeData.series[currentSeries]?.episodes || [];
    }

    displayEpisodes(episodesToLoad, false); // false = don't reset page
}

/**
 * Filter episodes by series
 */
function filterBySeries(seriesName) {
    currentSeries = seriesName;

    // Update filter button states
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if ((seriesName === 'all' && btn.textContent === 'All Series') ||
            btn.textContent.toLowerCase().replace(/\s+/g, '-') === seriesName.toLowerCase()) {
            btn.classList.add('active');
        }
    });

    // Filter and display episodes
    let filteredEpisodes;
    if (seriesName === 'all') {
        filteredEpisodes = allEpisodes;
    } else {
        filteredEpisodes = episodeData.series[seriesName]?.episodes || [];
    }

    displayEpisodes(filteredEpisodes, true); // true = reset page
}

/**
 * Utility Functions
 */

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
    return text.substr(0, maxLength) + '...';
}

/**
 * Get series image based on series name
 */
function getSeriesImage(seriesName) {
    const imageMap = {
        'dating': 'images/dating.png',
        'mesilas-yesharim': 'images/mesilas-yesharim.png',
        'shabbos': 'images/shabbos.png',
        'shalom-bayis': 'images/shalom-bayis.png',
        'shmiras-halashon': 'images/shmiras-halashon.png',
        'shmiras-einayim': 'images/shmiras-einayim.png',
        'shalom-bayis-hebrew': 'images/shalom-bayis-heb.png'
    };

    return imageMap[seriesName] || 'images/profile_2.jpg';
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
        'shalom-bayis-hebrew': 'בניית שלום ואושר בבית היהודי בעברית.'
    };

    return descriptions[seriesName] || 'A collection of teachings and insights on this important topic.';
}

/**
 * Handle episode play functionality
 */
function playEpisode(audioUrl) {
    if (audioUrl === '#') {
        alert('Audio file not available for this episode.');
        return;
    }

    // For Spotify embed URLs, open in new tab
    if (audioUrl.includes('spotify.com')) {
        window.open(audioUrl, '_blank');
    } else {
        // For other URLs, try to play directly
        window.open(audioUrl, '_blank');
    }
}

/**
 * Update episode counts on the page
 */
function updateEpisodeCounts() {
    if (!episodeData || !episodeData.series) return;

    // Update accordion episode counts on podcast page
    Object.keys(episodeData.series).forEach(seriesName => {
        const series = episodeData.series[seriesName];
        const episodeCount = series.episodes ? series.episodes.length : (series.episode_count || 0);

        // Update accordion headers with dynamic counts
        updateAccordionCount(seriesName, episodeCount);
    });
}

/**
 * Update homepage series card images dynamically
 */
function updateHomepageImages() {
    // Only run on homepage
    if (!document.querySelector('.hero-section')) return;

    const seriesCards = document.querySelectorAll('.series-card-main[data-series]');
    seriesCards.forEach(card => {
        const seriesName = card.getAttribute('data-series');
        if (seriesName) {
            const imageElement = card.querySelector('.card-image-main');
            if (imageElement) {
                const correctImagePath = getSeriesImage(seriesName);
                if (correctImagePath && imageElement.src !== correctImagePath) {
                    // Use relative path for homepage images
                    imageElement.src = correctImagePath;
                    console.log(`✅ Updated ${seriesName} image to: ${correctImagePath}`);
                }
            }
        }
    });
}

/**
 * Update accordion episode count for a specific series
 */
function updateAccordionCount(seriesName, count) {
    // Map series names to accordion selectors
    const seriesMap = {
        'dating': '.accordion-item[data-category="relationships"] .accordion-episodes',
        'shalom-bayis': '.accordion-item[data-category="marriage"] .accordion-episodes',
        'shmiras-einayim': '.accordion-item[data-category="purity"] .accordion-episodes',
        'shmiras-halashon': '.accordion-item[data-category="speech"] .accordion-episodes',
        'shabbos': '.accordion-item[data-category="shabbos"] .accordion-episodes',
        'mesilas-yesharim': '.accordion-item[data-category="character"] .accordion-episodes'
    };

    const selector = seriesMap[seriesName];
    if (selector) {
        const countElement = document.querySelector(selector);
        if (countElement) {
            countElement.textContent = `${count} episodes`;
            console.log(`✅ Updated ${seriesName} count to ${count}`);
        }
    }
}

/**
 * Display error message
 */
function displayError(message) {
    // Try different container IDs
    const container = document.getElementById('episodesGrid') ||
                     document.getElementById('episodes-grid') ||
                     document.getElementById('seriesGrid');
    if (container) {
        container.innerHTML = `<div class="error-message" style="color: red; padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 6px; margin: 1rem 0;">${message}</div>`;
    } else {
        console.error('Error:', message);
    }
}

// Export functions for global access
window.filterBySeries = filterBySeries;
window.playEpisode = playEpisode;
window.loadMoreEpisodes = loadMoreEpisodes;
