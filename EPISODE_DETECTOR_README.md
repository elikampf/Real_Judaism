# 🤖 Automated Podcast Episode Detection System

A complete automated system for detecting new podcast episodes from Spotify and updating your episode data files. Perfect for keeping your website's episode listings current without manual work.

## 🎯 Features

- **Automatic Detection**: Scans all your podcast series for new episodes
- **Smart Trailer Filtering**: Automatically excludes trailers and promotional content
- **Data Integrity**: Maintains exact format compatibility with your existing JSON files
- **Safe Updates**: Creates backups before making changes
- **Dry Run Mode**: Test changes without actually updating files
- **Automated Scheduling**: GitHub Actions workflow for daily automatic updates
- **Detailed Logging**: Comprehensive output showing exactly what was found and updated

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Spotify Developer Account** with API credentials
3. **GitHub Repository** (for automated deployment)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Your Series
The `episode_detector_config.json` file contains all your Spotify show IDs and settings. It's already configured with your series!

### 3. Test the System (Dry Run)
```bash
python episode_update.py --dry-run --verbose
```

### 4. Run Live Update
```bash
python episode_update.py --verbose
```

## 📖 Usage Guide

### Command Line Options

```bash
# Check all series and update files
python episode_update.py

# Preview changes without updating (recommended first!)
python episode_update.py --dry-run

# Check only specific series
python episode_update.py --series dating

# Skip backup creation (not recommended)
python episode_update.py --no-backup

# Show detailed progress information
python episode_update.py --verbose

# Get help
python episode_update.py --help
```

### Configuration

The `episode_detector_config.json` file controls everything:

```json
{
  "spotify": {
    "client_id": "your_client_id",
    "client_secret": "your_client_secret"
  },
  "shows": {
    "dating": "2hCOZGVEIEJM5gvdAKPLaU",
    "shalom-bayis": "644HQbfnHosBd9vscuYxFy"
    // ... all your series
  },
  "settings": {
    "trailer_keywords": ["trailer", "preview", "teaser"],
    "min_episode_duration_ms": 120000,
    "backup_files": true,
    "dry_run": false
  }
}
```

## 🔧 How It Works

### 1. Episode Detection Process
```
Spotify API → Trailer Filter → Data Formatter → File Updater
```

### 2. Smart Trailer Detection
The system automatically filters out trailers using:
- **Keyword Detection**: Checks titles for "trailer", "preview", "coming soon"
- **Duration Check**: Filters episodes shorter than 2 minutes (120,000ms)
- **Content Analysis**: Ensures episodes have substantial content

### 3. Data Formatting
Converts Spotify API data to match your exact JSON format:
- Dates: `2024-09-11T00:00:00.000Z` → `11-09-24`
- Duration: `2429000ms` → `40:29`
- URLs: Generates proper embed URLs
- Episode Numbers: Automatically assigned sequentially

### 4. Safe File Updates
- **Automatic Backups**: Creates timestamped backups before changes
- **Duplicate Prevention**: Skips episodes already in your files
- **Merge Logic**: Combines new episodes with existing data
- **Error Handling**: Graceful failure with detailed logging

## 🤖 Automated Deployment

### GitHub Actions Setup

1. **Push to GitHub**: Commit all files to your repository
2. **Enable Actions**: Go to repository Settings → Actions → General → Allow all actions
3. **Automatic Scheduling**: The system will run daily at 2:00 AM UTC

### Manual GitHub Actions Run

You can also trigger the workflow manually:
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **"Daily Episode Update"** workflow
4. Click **"Run workflow"**

## 📊 What Gets Updated

The system updates these files with new episodes:
- `data/dating_episodes.json`
- `data/shalom-bayis_episodes.json`
- `data/shalom-bayis-hebrew_episodes.json`
- `data/shmiras-einayim_episodes.json`
- `data/shmiras-halashon_episodes.json`
- `data/mesilas-yesharim_episodes.json`
- `data/shabbos_episodes.json`
- `data/shmiras-einayim-hebrew_episodes.json`

## 🔍 Monitoring & Logs

### GitHub Actions Logs
- View detailed logs in the **Actions** tab
- See exactly which episodes were found and added
- Monitor for any errors or issues

### Local Testing Logs
When running locally, you'll see detailed output like:
```
🎙️  Real Judaism Episode Detection System
==================================================
Started at: 2024-09-11 15:30:45

📋 Loading configuration...
✅ Configuration loaded successfully

🔍 Checking all series for new episodes...
🎙️  Checking series: dating
📡 Fetching episodes for show: 2hCOZGVEIEJM5gvdAKPLaU
✅ Found 8 valid episodes (filtered 0 trailers)
📂 Loaded 8 existing episodes from data/dating_episodes.json
🆕 New episode found: 'Ep9. New Episode Title'
✅ Found 1 new episodes for dating
✅ Successfully updated dating
```

## 🛠️ Troubleshooting

### Common Issues

**1. Authentication Errors**
```bash
❌ Failed to get Spotify access token
```
- Check your Client ID and Secret in `episode_detector_config.json`
- Verify your Spotify Developer App is still active

**2. Network Issues**
```bash
❌ Spotify API request failed
```
- Check your internet connection
- Spotify API might be temporarily unavailable

**3. File Permission Errors**
```bash
❌ Failed to save data/dating_episodes.json
```
- Ensure the `data/` directory is writable
- Check file permissions

**4. No New Episodes Found**
```bash
📋 No new episodes found across any series
```
- This is normal! It means all episodes are already in your files
- The system is working correctly

### Debug Mode
Run with maximum verbosity:
```bash
python episode_update.py --verbose --dry-run
```

## 🔒 Security Notes

- **Credentials**: Your Spotify API credentials are stored locally in `episode_detector_config.json`
- **GitHub**: Never commit sensitive credentials to version control
- **Backups**: The system creates automatic backups of all changes
- **Dry Run**: Always test with `--dry-run` first

## 📈 Customization

### Adding New Series
1. Get the Spotify Show ID from your podcast URL
2. Add to `episode_detector_config.json`:
```json
"shows": {
  "new-series": "SPOTIFY_SHOW_ID_HERE"
}
```

### Adjusting Trailer Detection
Modify the settings in `episode_detector_config.json`:
```json
"settings": {
  "trailer_keywords": ["trailer", "preview", "teaser", "promo"],
  "min_episode_duration_ms": 180000  // 3 minutes
}
```

### Changing Schedule
Edit `.github/workflows/episode-update.yml`:
```yaml
schedule:
  - cron: '0 2 * * *'  # Daily at 2 AM UTC
```

## 🎉 Success Stories

After setup, you'll see commits like:
```
🤖 Auto-update: New podcast episodes detected

Episodes updated by automated detection system.
Changes made on 2024-09-11 02:00 UTC
```

Your episode files will stay perfectly current with zero manual effort!

## 📞 Support

If you encounter issues:
1. Run with `--verbose` for detailed logs
2. Check the troubleshooting section above
3. Review GitHub Actions logs for automated runs
4. The system includes comprehensive error handling and logging

---

**Ready to automate your episode updates?** Just run `python episode_update.py --dry-run` to test, then remove `--dry-run` for live updates!
