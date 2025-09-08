#!/usr/bin/env node

/**
 * Manual Podcast Update Script
 * Run this locally to update episodes and push changes manually
 *
 * Usage:
 * node manual-update.js [podcast-filter]
 *
 * Examples:
 * node manual-update.js all
 * node manual-update.js dating
 * node manual-update.js "dating,shabbos"
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        console.log('🎧 Starting MANUAL podcast episode update...\n');

        // Get podcast filter from command line arguments
        const podcastFilter = process.argv[2] || 'all';
        console.log(`📋 Updating podcasts: ${podcastFilter}\n`);

        // Set environment variable for the update script
        process.env.PODCAST_FILTER = podcastFilter;

        // Run the update script
        console.log('🔄 Running update script...');
        execSync('node scripts/update-episodes.js', { stdio: 'inherit' });

        console.log('\n✅ Update script completed successfully!\n');

        // Check if episodes.json was modified
        const episodesPath = path.join(__dirname, 'data', 'episodes.json');

        if (fs.existsSync(episodesPath)) {
            console.log('📁 Checking for changes...');

            // Check git status
            const gitStatus = execSync('git status --porcelain data/episodes.json', {
                encoding: 'utf8',
                cwd: __dirname
            });

            if (gitStatus.trim()) {
                console.log('📝 Changes detected in episodes.json');
                console.log('📊 Changes:');
                console.log(gitStatus);

                console.log('\n🚀 Ready to commit and push changes!');
                console.log('Run these commands:');
                console.log('');
                console.log('git add data/episodes.json');
                console.log('git commit -m "Update podcast episodes"');
                console.log('git push origin main');
                console.log('');
                console.log('Then Netlify will automatically rebuild your site! 🎉');

            } else {
                console.log('ℹ️ No changes detected - all episodes are up to date!');
            }
        } else {
            console.log('❌ episodes.json not found - something went wrong with the update');
        }

    } catch (error) {
        console.error('❌ Error during manual update:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
