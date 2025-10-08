# Deployment Checklist for Podcast RSS Downloader

## Netlify Deployment Steps

### 1. Repository Setup
- ✅ Code pushed to GitHub repository: `https://github.com/elikampf/podcast.git`
- ✅ All files committed and pushed

### 2. Netlify Configuration
- ✅ `netlify.toml` configured with:
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Node version: 18

### 3. Environment Variables
**CRITICAL**: Set in Netlify dashboard under Site Settings > Environment Variables:
```
PASSWORD=your-secure-password-here
```

### 4. Build Settings in Netlify
- Repository: `elikampf/podcast`
- Branch: `master`
- Build command: `npm run build`
- Publish directory: `.next`

### 5. Post-Deployment Verification
1. Visit the deployed site URL
2. Check `/api/health` endpoint returns JSON status
3. Try accessing the password-protected app
4. Test RSS feed addition
5. Test episode selection and download

## Common Issues & Solutions

### Issue: "Build failed" in Netlify
**Solution**:
- Check build logs in Netlify dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility

### Issue: "PASSWORD environment variable not set"
**Solution**:
- Go to Netlify dashboard > Site Settings > Environment Variables
- Add `PASSWORD` variable with your chosen password
- Redeploy the site

### Issue: "404 on API routes"
**Solution**:
- Netlify automatically handles Next.js API routes
- Check that routes are in `app/api/` directory
- Verify the routes export proper HTTP method functions

### Issue: "CORS errors"
**Solution**:
- API routes should work automatically with Next.js on Netlify
- Check browser console for specific CORS errors

### Issue: "Image loading errors"
**Solution**:
- `next.config.js` allows all domains for images
- Podcast cover images should load from any HTTPS source

## Testing Commands

After deployment, test these endpoints:
- `GET /api/health` - Should return server status
- `POST /api/check-password` - Should validate password
- `POST /api/fetch-rss` - Should parse RSS feeds

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PASSWORD` | ✅ | Password for app access |

## Troubleshooting Tips

1. **Check Netlify build logs** for specific error messages
2. **Test locally** with `npm run build && npm start`
3. **Verify environment variables** are set correctly
4. **Check browser developer tools** for JavaScript errors
5. **Test API endpoints** individually using tools like Postman

## Support

If deployment issues persist:
1. Check this checklist again
2. Review Netlify build logs
3. Verify environment variable configuration
4. Test API endpoints manually
5. Check browser console for runtime errors
