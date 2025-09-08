#!/usr/bin/env node

/**
 * SIMPLE PODCAST UPDATE SCRIPT
 * This script works 100% locally and gives you exact instructions
 *
 * Usage: node simple-update.js [podcast-name]
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');

// RSS Feed URLs
const RSS_FEEDS = {
    'mesilas-yesharim': 'https://anchor.fm/s/fed2ca40/podcast/rss',
    'dating': 'https://anchor.fm/s/feb96960/podcast/rss',
    'shabbos': 'https://anchor.fm/s/feb96e74/podcast/rss',
    'shalom-bayis': 'https://anchor.fm/s/feb97a90/podcast/rss',
    'shmiras-halashon': 'https://anchor.fm/s/feb96384/podcast/rss',
    'shmiras-einayim': 'https://anchor.fm/s/feb98774/podcast/rss',
    'shalom-bayis-hebrew': 'https://anchor.fm/s/feb890f8/podcast/rss',
    'shmiras-einayim-hebrew': 'https://anchor.fm/s/10902f990/podcast/rss'
};

// Exclusion rules
const EXCLUDE_RULES = {
    titleContains: ['trailer'],
    descriptionContains: ['trailer']
};

/**
 * Fetch RSS feed with SSL bypass
 */
function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        const agent = new https.Agent({
            rejectUnauthorized: false
        });

        https.get(url, { agent }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

/**
 * Parse RSS XML (simple parsing)
 */
function parseEpisodes(rssText, seriesName) {
    const episodes = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(rssText)) !== null) {
        const itemContent = match[1];

        const title = extractValue(itemContent, 'title');
        const description = extractValue(itemContent, 'description');
        const pubDate = extractValue(itemContent, 'pubDate');
        const enclosure = extractAttribute(itemContent, 'enclosure', 'url');
        const duration = extractValue(itemContent, 'itunes:duration');

        if (title && pubDate) {
            const episode = {
                title: cleanText(title),
                description: cleanText(description) || '',
                date: formatDate(pubDate),
                length: formatDuration(duration),
                spotify_embed_url: generateSpotifyUrl(enclosure),
                series: seriesName,
                episode_number: extractEpisodeNumber(title),
                file_path: `data/${seriesName.replace('-', '_')}_episodes.csv`
            };

            // Check exclusions
            if (!shouldExclude(episode)) {
                episodes.push(episode);
            }
        }
    }

    return episodes;
}

/**
 * Helper functions
 */
function extractValue(content, tagName) {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\/${tagName}>`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
}

function extractAttribute(content, tagName, attribute) {
    const regex = new RegExp(`<${tagName}[^>]*${attribute}="([^"]*)"`, 'i');
    const match = content.match(regex);
    return match ? match[1] : null;
}

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

function formatDuration(duration) {
    if (!duration) return 'N/A';
    if (/^\d+$/.test(duration)) {
        const totalMinutes = Math.floor(parseInt(duration) / 60);
        const seconds = parseInt(duration) % 60;
        return `${totalMinutes}.${seconds.toString().padStart(2, '0')} min`;
    }
    return duration;
}

function generateSpotifyUrl(audioUrl) {
    if (!audioUrl) return '#';
    const spotifyMatch = audioUrl.match(/episode\/([a-zA-Z0-9]+)/);
    if (spotifyMatch) {
        return `https://open.spotify.com/embed/episode/${spotifyMatch[1]}`;
    }
    return audioUrl;
}

function extractEpisodeNumber(title) {
    const match = title.match(/(?:Ep|Episode)\.?\s*(\d+)/i);
    return match ? parseInt(match[1]) : null;
}

function shouldExclude(episode) {
    const titleLower = episode.title.toLowerCase();
    const descLower = episode.description.toLowerCase();

    for (const excludeWord of EXCLUDE_RULES.titleContains) {
        if (titleLower.includes(excludeWord.toLowerCase())) {
            console.log(`🚫 Excluding: "${episode.title}" (contains "${excludeWord}")`);
            return true;
        }
    }

    for (const excludeWord of EXCLUDE_RULES.descriptionContains) {
        if (descLower.includes(excludeWord.toLowerCase())) {
            console.log(`🚫 Excluding: "${episode.title}" (description contains "${excludeWord}")`);
            return true;
        }
    }

    return false;
}

/**
 * Main update function
 */
async function updatePodcasts(podcastName = null) {
    try {
        console.log('🎧 REAL JUDAISM PODCAST UPDATER');
        console.log('=====================================\n');

        // Load existing data
        let existingData = { episodes: [], series: {} };
        try {
            const dataPath = path.join(__dirname, 'data', 'episodes.json');
            const existingContent = await fs.readFile(dataPath, 'utf8');
            existingData = JSON.parse(existingContent);
        } catch (error) {
            console.log('📄 Creating new episodes.json file\n');
        }

        // Determine which podcasts to update
        const podcastsToUpdate = podcastName ?
            (RSS_FEEDS[podcastName] ? [podcastName] : Object.keys(RSS_FEEDS)) :
            Object.keys(RSS_FEEDS);

        console.log(`📋 Updating ${podcastsToUpdate.length} podcast(s):`);
        podcastsToUpdate.forEach(name => console.log(`   • ${name}`));
        console.log('');

        let totalNewEpisodes = 0;

        // Update each podcast
        for (const podcastName of podcastsToUpdate) {
            console.log(`🔍 Updating ${podcastName}...`);
            console.log(`   📡 RSS URL: ${RSS_FEEDS[podcastName]}`);

            try {
                const rssUrl = RSS_FEEDS[podcastName];
                console.log(`   🌐 Fetching RSS feed...`);
                const rssText = await fetchRSS(rssUrl);
                console.log(`   📄 RSS feed loaded (${rssText.length} characters)`);

                const newEpisodes = parseEpisodes(rssText, podcastName);
                console.log(`   📊 Parsed ${newEpisodes.length} episodes from RSS`);

                // Filter out existing episodes
                const existingTitles = new Set(
                    existingData.episodes
                        .filter(ep => ep.series === podcastName)
                        .map(ep => ep.title)
                );

                const actuallyNew = newEpisodes.filter(ep => !existingTitles.has(ep.title));
                console.log(`   🎯 After filtering duplicates: ${actuallyNew.length} new episodes`);

                if (actuallyNew.length > 0) {
                    console.log(`✅ Found ${actuallyNew.length} new episodes for ${podcastName}`);
                    existingData.episodes.push(...actuallyNew);
                    totalNewEpisodes += actuallyNew.length;

                    // Initialize series if it doesn't exist
                    if (!existingData.series[podcastName]) {
                        existingData.series[podcastName] = { episodes: [] };
                    }
                    existingData.series[podcastName].episodes.push(...actuallyNew);
                } else {
                    console.log(`ℹ️ No new episodes for ${podcastName}`);

                    // Still initialize series structure if it doesn't exist
                    if (!existingData.series[podcastName]) {
                        existingData.series[podcastName] = { episodes: [] };
                    }
                }

            } catch (error) {
                console.log(`❌ Error updating ${podcastName}: ${error.message}`);
                console.log(`   🔍 Error details:`, error);

                // Still initialize series structure even on error
                if (!existingData.series[podcastName]) {
                    existingData.series[podcastName] = { episodes: [] };
                }
            }
        }

        console.log(`\n📊 TOTAL: ${totalNewEpisodes} new episodes found`);

        // Always save the data (even if no new episodes) to ensure proper structure
        console.log(`\n💾 Saving episode data...`);

        // Sort episodes by date (newest first)
        existingData.episodes.sort((a, b) => {
            const dateA = new Date(a.date.split('-').reverse().join('-'));
            const dateB = new Date(b.date.split('-').reverse().join('-'));
            return dateB - dateA;
        });

        // Update metadata
        existingData.last_updated = new Date().toISOString();
        existingData.series_count = Object.keys(RSS_FEEDS).length;

        // Ensure all series are properly initialized
        Object.keys(RSS_FEEDS).forEach(seriesName => {
            if (!existingData.series[seriesName]) {
                existingData.series[seriesName] = { episodes: [] };
            }
            // Update episode count for each series
            existingData.series[seriesName].episode_count = existingData.series[seriesName].episodes.length;
        });

        // Save updated data
        const dataDir = path.join(__dirname, 'data');
        await fs.mkdir(dataDir, { recursive: true });

        // Save in the format the website expects
        const websiteFormat = {
            episodes: existingData.episodes,
            series: existingData.series,
            series_count: existingData.series_count,
            last_updated: existingData.last_updated
        };

        await fs.writeFile(
            path.join(dataDir, 'episodes.json'),
            JSON.stringify(websiteFormat, null, 2),
            'utf8'
        );

        console.log('✅ Episodes data saved successfully!');
        console.log(`📊 Total episodes: ${existingData.episodes.length}`);
        console.log(`🎙️ Total series: ${Object.keys(existingData.series).length}`);

        if (totalNewEpisodes > 0) {
            console.log(`✨ New episodes added: ${totalNewEpisodes}`);
        }

        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Check data/episodes.json to verify the updates');
        console.log('2. Commit and push to GitHub:');
        console.log('   git add data/episodes.json');
        console.log('   git commit -m "Update podcast episodes"');
        console.log('   git push origin main');
        console.log('3. Your website will automatically show the updated episodes!');

    } catch (error) {
        console.error('❌ Fatal error:', error.message);
        process.exit(1);
    }
}

// Get podcast name from command line
const podcastArg = process.argv[2];
updatePodcasts(podcastArg);
