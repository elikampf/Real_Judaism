// Simple episode loader for podcast series
async function loadEpisodes(seriesName) {
    try {
        const response = await fetch(`../data/${seriesName}_episodes.json`);
        let data = await response.json();

        // Sort episodes based on series name
        const seriesSortOrder = {
            'shmiras-einayim': 'oldest',
            'dating': 'oldest',
            'shalom-bayis': 'oldest',
            'mesilas-yesharim': 'newest',
            'shmiras-halashon': 'newest',
            'shabbos': 'newest'
        };

        const sortOrder = seriesSortOrder[seriesName] || 'newest'; // Default to newest if not specified

        data.episodes.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (sortOrder === 'newest') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });

        const episodesContainer = document.getElementById('episodes-grid');
        if (!episodesContainer) return;

        episodesContainer.innerHTML = '';

        data.episodes.forEach(episode => {
            const episodeElement = document.createElement('div');
            episodeElement.className = 'episode-card-series';
            episodeElement.innerHTML = `
                <div class="episode-spotify-container">
                    ${episode.spotify_embed_url ? `<iframe class="episode-spotify-embed" src="${episode.spotify_embed_url.replace('/track/', '/embed/track/')}" width="100%" height="232" frameborder="0" allowtransparency="true" allow="encrypted-media" loading="lazy"></iframe>` : ''}
                </div>
                <div class="episode-card-content">
                     <div class="episode-card-header">
                        <span class="episode-number">${episode.title}</span>
                     </div>
                    <p class="episode-card-description">${episode.description || 'No description available'}</p>
                </div>
            `;
            episodesContainer.appendChild(episodeElement);
        });

        // Hide loader and show content
        const loadingContainer = document.getElementById('episodes-loading');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        episodesContainer.style.display = 'grid';

    } catch (error) {
        console.error('Error loading episodes:', error);
        const container = document.getElementById('episodes-grid');
        if (container) {
            container.innerHTML = '<p>Error loading episodes.</p>';
        }
    }
}

// Auto-detect series from URL and load episodes
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    let seriesName = '';

    if (path.includes('dating')) seriesName = 'dating';
    else if (path.includes('shalom-bayis')) seriesName = 'shalom-bayis';
    else if (path.includes('shmiras-einayim')) seriesName = 'shmiras-einayim';
    else if (path.includes('shmiras-halashon')) seriesName = 'shmiras-halashon';
    else if (path.includes('shabbos')) seriesName = 'shabbos';
    else if (path.includes('mesilas-yesharim')) seriesName = 'mesilas-yesharim';

    if (seriesName) {
        loadEpisodes(seriesName);
    }
});
