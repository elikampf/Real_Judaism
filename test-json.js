// Test script to verify the JSON file structure
const fs = require('fs');
const path = require('path');

try {
    const dataPath = path.join(__dirname, 'data', 'episodes.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    console.log('✅ JSON file loaded successfully');
    console.log('📊 Data structure:');

    if (data.episodes && Array.isArray(data.episodes)) {
        console.log(`✅ episodes: Array with ${data.episodes.length} items`);
    } else {
        console.log('❌ episodes: Missing or not an array');
    }

    if (data.series && typeof data.series === 'object') {
        console.log(`✅ series: Object with ${Object.keys(data.series).length} series`);
        Object.keys(data.series).forEach(seriesName => {
            const series = data.series[seriesName];
            if (series.episodes && Array.isArray(series.episodes)) {
                console.log(`   - ${seriesName}: ${series.episodes.length} episodes`);
            } else {
                console.log(`   ❌ ${seriesName}: episodes property missing or not array`);
            }
        });
    } else {
        console.log('❌ series: Missing or not an object');
    }

    if (data.episodes && data.episodes.length > 0) {
        console.log('\n🔍 Sample episode:');
        console.log(JSON.stringify(data.episodes[0], null, 2));
    }

} catch (error) {
    console.error('❌ Error loading JSON:', error.message);
}
