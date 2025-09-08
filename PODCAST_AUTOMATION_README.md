# Real Judaism Podcast Automation Setup

This guide will help you set up automated daily podcast episode updates and password-protected manual updates for your Real Judaism website.

## 🚀 Quick Setup Overview

1. **GitHub Actions** - Automatic daily updates at 12pm
2. **Password Protection** - Secure admin page for manual updates
3. **Netlify Integration** - Automatic rebuilds when episodes update

## 📋 Prerequisites

- GitHub repository: `elikampf/Real_Judaism`
- Netlify account connected to your repository
- Basic understanding of GitHub and Netlify

## 🔧 Step 1: GitHub Repository Setup

### 1.1 Configure Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

**Required:**
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no action needed)

**Optional (for Netlify integration):**
- `NETLIFY_BUILD_HOOK` - Your Netlify build hook URL

### 1.2 Get Your Netlify Build Hook URL (Optional)

1. Go to your Netlify site dashboard
2. Go to Site settings → Build & deploy → Build hooks
3. Create a new build hook called "Podcast Update"
4. Copy the webhook URL
5. Add it as `NETLIFY_BUILD_HOOK` secret in GitHub

## ⏰ Step 2: Automated Daily Updates

The GitHub Actions workflow (`.github/workflows/update-episodes.yml`) will:

- ✅ Run every day at **12:00 PM UTC** (adjust timezone in workflow file if needed)
- ✅ Check all podcast RSS feeds for new episodes
- ✅ Update `data/episodes.json` with new episodes
- ✅ Commit changes back to repository
- ✅ Trigger Netlify rebuild (if configured)

### Timezone Adjustment

To change the update time, modify the cron expression in `.github/workflows/update-episodes.yml`:

```yaml
# Current: 12:00 PM UTC
- cron: '0 12 * * *'

# Examples:
# 12:00 PM EST (adjust by -5 hours from UTC)
- cron: '0 17 * * *'
# 12:00 PM PST (adjust by -8 hours from UTC)
- cron: '0 20 * * *'
```

## 🔐 Step 3: Password-Protected Admin Page

### 3.1 Access the Admin Page

Visit: `https://yourdomain.com/admin.html`

### 3.2 Change the Admin Password

**IMPORTANT:** Change the default password in `admin.html`:

```javascript
const ADMIN_PASSWORD = 'YourSecurePasswordHere123!';
```

### 3.3 Admin Features

- **Update All Podcasts** - Triggers workflow to check all RSS feeds
- **Update Specific Podcast** - Choose individual podcast to update
- **Real-time Status** - Shows success/failure messages
- **Session Management** - Stays logged in during browser session

### 3.4 Manual Workflow Triggers

You can also trigger updates directly from GitHub:

1. Go to your repository → Actions tab
2. Click "Update Podcast Episodes" workflow
3. Click "Run workflow"
4. Choose podcast filter: `all`, `mesilas-yesharim`, etc.

## 📊 Step 4: Understanding the Data Structure

### Episodes Data File

The system creates/updates `data/episodes.json`:

```json
{
  "episodes": [
    {
      "title": "Episode Title",
      "description": "Episode description...",
      "date": "25-01-2025",
      "length": "45.30 min",
      "spotify_embed_url": "https://open.spotify.com/embed/episode/...",
      "series": "mesilas-yesharim",
      "episode_number": 42,
      "file_path": "data/mesilas_yesharim_episodes.csv"
    }
  ],
  "series": {
    "mesilas-yesharim": {
      "episodes": [...],
      "episode_count": 42
    }
  },
  "series_count": 8,
  "last_updated": "2025-01-25T12:00:00.000Z"
}
```

### Podcast Schedule Configuration

The update frequency is controlled in `scripts/update-episodes.js`:

```javascript
const PODCAST_CONFIG = {
  'mesilas-yesharim': {
    rss: 'https://anchor.fm/s/fed2ca40/podcast/rss',
    schedule: ['sunday'] // Sundays
  },
  'dating': {
    rss: 'https://anchor.fm/s/feb96960/podcast/rss',
    schedule: ['monthly'] // Monthly check
  },
  // ... more podcasts
};
```

## 🧪 Step 5: Testing the Setup

### 5.1 Test the Update Script Locally

```bash
# Install dependencies
npm install

# Test update for all podcasts
npm run test-update

# Test update for specific podcast
PODCAST_FILTER=mesilas-yesharim npm run update-episodes
```

### 5.2 Test GitHub Actions Workflow

1. Go to GitHub repository → Actions tab
2. Click "Update Podcast Episodes"
3. Click "Run workflow"
4. Check the logs for any errors

### 5.3 Test Admin Page

1. Visit `admin.html` in your browser
2. Enter the admin password
3. Try triggering an update
4. Check GitHub Actions to confirm workflow started

## 🔧 Step 6: Customization Options

### 6.1 Change Update Schedule

Edit `.github/workflows/update-episodes.yml`:

```yaml
on:
  schedule:
    # Multiple times per day
    - cron: '0 12,18 * * *'  # 12pm and 6pm UTC
    # Weekly on specific days
    - cron: '0 12 * * 1,3,5'  # Monday, Wednesday, Friday
```

### 6.2 Add New Podcasts

Edit `scripts/update-episodes.js`:

```javascript
const PODCAST_CONFIG = {
  'new-podcast': {
    rss: 'https://example.com/rss',
    schedule: ['daily'], // daily, weekly, monthly, etc.
    series: 'new-podcast'
  }
};
```

### 6.3 Modify Admin Page Styling

The admin page uses vanilla CSS. Customize colors, layout, etc. in the `<style>` section.

## 🚨 Troubleshooting

### Common Issues:

**1. GitHub Actions fails with "fetch is not defined"**
- ✅ Fixed: Added `node-fetch` dependency

**2. Netlify doesn't rebuild automatically**
- Check your `NETLIFY_BUILD_HOOK` secret is correct
- Verify the webhook URL in Netlify dashboard

**3. Episodes not updating**
- Check RSS feed URLs are still valid
- Look at GitHub Actions logs for parsing errors
- Test locally with `npm run test-update`

**4. Admin page shows wrong domain**
- Update `GITHUB_OWNER` and `GITHUB_REPO` in admin.html

**5. Password not working**
- Make sure to change `ADMIN_PASSWORD` in admin.html
- Clear browser cache/cookies if issues persist

### Debug Commands:

```bash
# Check current episodes data
cat data/episodes.json

# Test specific podcast update
PODCAST_FILTER=mesilas-yesharim node scripts/update-episodes.js

# Check GitHub Actions logs
# Go to repository → Actions → Latest workflow run → View logs
```

## 📞 Support

If you encounter issues:

1. Check GitHub Actions logs for error details
2. Test the update script locally
3. Verify all RSS feed URLs are accessible
4. Ensure repository secrets are configured correctly

## 🔒 Security Notes

- **Change the default admin password** immediately
- **Never commit sensitive information** to the repository
- **Use HTTPS** for your admin page in production
- **Consider adding IP restrictions** if you want extra security
- **Regularly rotate** your admin password

## 🎯 Success Checklist

- [ ] GitHub Actions workflow created and enabled
- [ ] Repository secrets configured (NETLIFY_BUILD_HOOK optional)
- [ ] Admin password changed from default
- [ ] Test update script locally
- [ ] Test GitHub Actions workflow manually
- [ ] Test admin page functionality
- [ ] Verify Netlify rebuilds automatically (if configured)
- [ ] Check that episodes appear on your website

Your podcast automation system is now ready! Episodes will update automatically every day at 12pm, and you can manually trigger updates anytime through the secure admin page.
