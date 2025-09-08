/**
 * Real Judaism Podcast Episode Auto-Updater
 * Fetches new episodes from RSS feeds and updates episodes.json
 */

const fs = require('fs').promises;
const path = require('path');

// RSS Feed Configuration
const PODCAST_CONFIG = {
    'mesilas-yesharim': {
        rss: 'https://anchor.fm/s/fed2ca40/podcast/rss',
        schedule: ['sunday'], // Sundays
        series: 'mesilas-yesharim'
    },
    'dating': {
        rss: 'https://anchor.fm/s/feb96960/podcast/rss', 
        schedule: ['monthly'], // Monthly check
        series: 'dating'
    },
    'shabbos': {
        rss: 'https://anchor.fm/s/feb96e74/podcast/rss',
        schedule: ['tuesday'], // Tuesdays  
        series: 'shabbos'
    },
    'shalom-bayis': {
        rss: 'https://anchor.fm/s/feb97a90/podcast/rss',
        schedule: ['monthly'], // Monthly check
        series: 'shalom-bayis'
    },
    'shmiras-halashon': {
        rss: 'https://anchor.fm/s/feb96384/podcast/rss',
        schedule: ['monday', 'wednesday', 'friday'], // 3x per week
        series: 'shmiras-halashon'
    },
    'shmiras-einayim': {
        rss: 'https://anchor.fm/s/feb98774/podcast/rss',
        schedule: ['monthly'], // Monthly check
        series: 'shmiras-einayim'
    },
    'shalom-bayis-hebrew': {
        rss: 'https://anchor.fm/s/feb890f8/podcast/rss',
        schedule: ['monthly'], // Monthly check
        series: 'shalom-bayis-hebrew'
    },
    'shmiras-einayim-hebrew': {
        rss: 'https://anchor.fm/s/10902f990/podcast/rss',
        schedule: ['bimonthly'], // Every 2 weeks
        series: 'shmiras-einayim-hebrew'
    }
};

// Exclusion rules
const EXCLUDE_RULES = {
    titleContains: ['trailer', 'test', 'draft', 'private'],
    descriptionContains: ['trailer']
};

/**
 * Main execution function
 */
async function main() {
    try {
        console.log('🎧 Starting podcast episode update...');
        
        // Determine which podcasts to check
        const podcastsToCheck = getPodcastsToCheck();
        console.log(`📋 Checking podcasts: ${podcastsToCheck.join(', ')}`);
        
        // Load current episodes data
        const currentData = await loadCurrentEpisodes();
        
        // Check each podcast for new episodes
        let hasUpdates = false;
        for (const podcastKey of podcastsToCheck) {
            const config = PODCAST_CONFIG[podcastKey];
            if (!config) {
                console.log(`⚠️ Unknown podcast: ${podcastKey}`);
                continue;
            }
            
            console.log(`🔍 Checking ${podcastKey}...`);
            const newEpisodes = await checkPodcastForNewEpisodes(config, currentData);
            
            if (newEpisodes.length > 0) {
                console.log(`✅ Found ${newEpisodes.length} new episodes for ${podcastKey}`);
                addNewEpisodesToData(currentData, newEpisodes, config.series);
                hasUpdates = true;
            } else {
                console.log(`ℹ️ No new episodes for ${podcastKey}`);
            }
        }
        
        // Save updated data if there were changes
        if (hasUpdates) {
            await saveEpisodeData(currentData);
            console.log('💾 Episodes data updated successfully!');
        } else {
            console.log('ℹ️ No updates needed');
        }
        
    } catch (error) {
        console.error('❌ Error updating episodes:', error);
        process.exit(1);
    }
}

/**
 * Determine which podcasts to check based on schedule or manual input
 */
function getPodcastsToCheck() {
    const filter = process.env.PODCAST_FILTER || 'auto';
    
    if (filter === 'all') {
        return Object.keys(PODCAST_CONFIG);
    }
    
    if (filter !== 'auto') {
        // Manual filter - comma separated list
        return filter.split(',').map(p => p.trim());
    }
    
    // Auto mode - determine based on current day/schedule
    const today = new Date();
    const dayOfWeek = today.toLocaleLowerCase('en-US', { weekday: 'long' });
    const dayOfMonth = today.getDate();
    
    const podcastsToCheck = [];
    
    for (const [key, config] of Object.entries(PODCAST_CONFIG)) {
        if (config.schedule.includes(dayOfWeek)) {
            podcastsToCheck.push(key);
        } else if (config.schedule.includes('monthly') && dayOfMonth === 1) {
            podcastsToCheck.push(key);
        } else if (config.schedule.includes('bimonthly') && (dayOfMonth === 1 || dayOfMonth === 15)) {
            podcastsToCheck.push(key);
        }
    }
    
    return podcastsToCheck;
}

/**
 * Load current episodes.json data
 */
async function loadCurrentEpisodes() {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'episodes.json');
        const data = await fs.readFile(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Creating new episodes.json file...');
        return {
            episodes: [],
            series: {},
            series_count: 0,
            last_updated: new Date().toISOString()
        };
    }
}

/**
 * Check a podcast for new episodes
 */
async function checkPodcastForNewEpisodes(config, currentData) {
    try {
        const response = await fetch(config.rss);
        const rssText = await response.text();
        
        // Parse RSS XML (simple parsing)
        const episodes = parseRSSEpisodes(rssText, config.series);
        
        // Filter out episodes that already exist
        const existingTitles = new Set(
            currentData.episodes
                .filter(ep => ep.series === config.series)
                .map(ep => ep.title)
        );
        
        const newEpisodes = episodes.filter(episode => {
            // Skip if episode already exists
            if (existingTitles.has(episode.title)) return false;
            
            // Skip if episode should be excluded
            if (shouldExcludeEpisode(episode)) return false;
            
            return true;
        });
        
        return newEpisodes;
        
    } catch (error) {
        console.error(`Error checking ${config.series}:`, error);
        return [];
    }
}

/**
 * Parse episodes from RSS XML
 */
function parseRSSEpisodes(rssText, seriesName) {
    const episodes = [];
    
    // Extract items from RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;
    
    while ((match = itemRegex.exec(rssText)) !== null) {
        const itemContent = match[1];
        
        const title = extractXMLValue(itemContent, 'title');
        const description = extractXMLValue(itemContent, 'description');
        const pubDate = extractXMLValue(itemContent, 'pubDate');
        const enclosure = extractXMLAttribute(itemContent, 'enclosure', 'url');
        const duration = extractXMLValue(itemContent, 'itunes:duration');
        
        if (title && pubDate) {
            const episode = {
                title: cleanText(title),
                description: cleanText(description) || '',
                date: formatDate(pubDate),
                length: formatDuration(duration),
                spotify_embed_url: generateSpotifyEmbedUrl(enclosure),
                series: seriesName,
                episode_number: extractEpisodeNumber(title),
                file_path: `data\\${seriesName.replace('-', '_')}_episodes.csv`
            };
            
            episodes.push(episode);
        }
    }
    
    return episodes;
}

/**
 * Extract value from XML tag
 */
function extractXMLValue(content, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

/**
 * Extract attribute from XML tag
 */
function extractXMLAttribute(content, tagName, attribute) {
    const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"`, 'i');
    const match = content.match(regex);
    return match ? match[1] : null;
}

/**
 * Clean HTML/XML entities from text
 */
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
        .replace(/<[^>]*>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
}

/**
 * Format date to DD-MM-YY format
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
}

/**
 * Format duration
 */
function formatDuration(duration) {
    if (!duration) return 'N/A';
    
    // Convert seconds to minutes if needed
    if (/^\d+$/.test(duration)) {
        const totalMinutes = Math.floor(parseInt(duration) / 60);
        const seconds = parseInt(duration) % 60;
        return `${totalMinutes}.${seconds.toString().padStart(2, '0')} min`;
    }
    
    // If it's already in MM:SS format, convert to decimal minutes
    if (/^\d+:\d+$/.test(duration)) {
        const [minutes, seconds] = duration.split(':').map(Number);
        const decimalMinutes = minutes + (seconds / 60);
        return `${decimalMinutes.toFixed(2)} min`;
    }
    
    return duration;
}

/**
 * Generate Spotify embed URL from audio URL
 */
function generateSpotifyEmbedUrl(audioUrl) {
    if (!audioUrl) return '#';
    
    // Try to extract Spotify episode ID from the URL
    const spotifyMatch = audioUrl.match(/episode\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return `https://open.spotify.com/embed/episode/${spotifyMatch[1]}`;
    }
    
    // For Anchor URLs, try to extract episode ID
    const anchorMatch = audioUrl.match(/anchor\.fm.*\/([a-zA-Z0-9-]+)\.(mp3|m4a)/);
    if (anchorMatch) {
        // This is a fallback - you might need to adjust based on your actual URLs
        return audioUrl;
    }
    
    return audioUrl;
}

/**
 * Extract episode number from title
 */
function extractEpisodeNumber(title) {
    const match = title.match(/(?:Ep|Episode)\.?\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
}

/**
 * Check if episode should be excluded
 */
function shouldExcludeEpisode(episode) {
    const titleLower = episode.title.toLowerCase();
    const descLower = episode.description.toLowerCase();
    
    // Check title exclusions
    for (const excludeWord of EXCLUDE_RULES.titleContains) {
        if (titleLower.includes(excludeWord.toLowerCase())) {
            console.log(`🚫 Excluding episode "${episode.title}" - contains "${excludeWord}"`);
            return true;
        }
    }
    
    // Check description exclusions
    for (const excludeWord of EXCLUDE_RULES.descriptionContains) {
        if (descLower.includes(excludeWord.toLowerCase())) {
            console.log(`🚫 Excluding episode "${episode.title}" - description contains "${excludeWord}"`);
            return true;
        }
    }
    
    return false;
}

/**
 * Add new episodes to the data structure
 */
function addNewEpisodesToData(data, newEpisodes, seriesName) {
    // Add episodes to main episodes array
    data.episodes.push(...newEpisodes);
    
    // Initialize series if it doesn't exist
    if (!data.series[seriesName]) {
        data.series[seriesName] = {
            episodes: [],
            episode_count: 0
        };
    }
    
    // Add episodes to series-specific array
    data.series[seriesName].episodes.push(...newEpisodes);
    data.series[seriesName].episode_count = data.series[seriesName].episodes.length;
    
    // Update series count
    data.series_count = Object.keys(data.series).length;
    
    // Update last updated timestamp
    data.last_updated = new Date().toISOString();
    
    // Sort episodes by date (newest first)
    data.episodes.sort((a, b) => new Date(parseDate(b.date)) - new Date(parseDate(a.date)));
    data.series[seriesName].episodes.sort((a, b) => new Date(parseDate(b.date)) - new Date(parseDate(a.date)));
}

/**
 * Parse DD-MM-YY date format back to Date object
 */
function parseDate(dateStr) {
    const [day, month, year] = dateStr.split('-');
    return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
}

/**
 * Save updated episodes data
 */
async function saveEpisodeData(data) {
    const dataPath = path.join(process.cwd(), 'data', 'episodes.json');
    
    // Ensure data directory exists
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    
    // Write updated data
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

// Run the main function
main().catch(console.error);