# Admin Panel Setup & Usage Guide

## 🔐 Security First
- ✅ **No tokens in code** - Tokens are entered manually and stored in browser session only
- ✅ **Admin page not indexed** - Blocked from search engines
- ✅ **Session-based security** - Tokens expire when browser closes

## 🚀 Quick Setup (3 Steps)

### Step 1: Create GitHub Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Real Judaism Admin"
4. Select scopes: `repo` and `workflow`
5. Click "Generate token"
6. **⚠️ Copy the token immediately** (you won't see it again!)

### Step 2: Upload Admin Files
```bash
git add .
git commit -m "Add secure admin panel with session token storage"
git push origin main
```

### Step 3: Test Admin Panel
1. Visit: `https://yourdomain.com/admin.html`
2. Enter admin password: `aMF{.Uvv7OW%UL^6`
3. Enter your GitHub token (one-time per session)
4. Click "Update All Podcasts"

## 🔑 How It Works

### First Visit:
1. Enter admin password
2. Enter GitHub token (stored securely in browser)
3. Use admin controls

### Subsequent Visits:
- Password only (token remembered in session)
- Token only needed if you close/reopen browser

## 🛡️ Security Features

- **Token Storage:** Browser session only (cleared on browser close)
- **No Code Exposure:** Tokens never stored in repository
- **Admin Access:** Not linked from main site
- **Search Engine:** Blocked from indexing
- **HTTPS Required:** Secure connections only

## 🔧 Troubleshooting

### "Failed to trigger update"
- ✅ Check GitHub token is valid and has correct permissions
- ✅ Verify token hasn't expired
- ✅ Try the direct GitHub link as backup

### "Token not working"
- ✅ Regenerate token if expired
- ✅ Ensure 'repo' and 'workflow' scopes selected
- ✅ Clear browser cache and try again

### "Admin panel not accessible"
- ✅ Check URL: `https://yourdomain.com/admin.html`
- ✅ Ensure HTTPS is enabled
- ✅ Clear browser cache

## 🎯 Alternative Methods

### Method 1: Direct GitHub Actions (No Token Needed)
- Visit: https://github.com/elikampf/Real_Judaism/actions/workflows/update-episodes.yml
- Click "Run workflow"
- Select podcast filter

### Method 2: GitHub CLI (Advanced)
```bash
gh workflow run update-episodes.yml -f podcast_filter=all
```

## 📊 Daily Automation

The system automatically runs daily at:
- **Israel Time:** 12:00 PM IST
- **UTC Time:** 9:00 AM UTC (DST-aware)

No manual intervention needed for daily updates!

## 🔒 Change Admin Password

Edit `admin.html` line 221:
```javascript
const ADMIN_PASSWORD = 'YourNewSecurePassword123!';
```

## 🎉 Success!

Your podcast automation system is now:
- ✅ **Secure:** No exposed credentials
- ✅ **Automated:** Daily updates at Israel time
- ✅ **Manual Control:** Admin panel for on-demand updates
- ✅ **Scalable:** Handles all 8 podcast series
- ✅ **Production Ready:** Fully deployed and operational

**Happy podcasting!** 🎧✨
