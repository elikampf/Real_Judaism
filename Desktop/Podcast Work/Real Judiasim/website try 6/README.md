# Website Try 5 - Real Judaism

A clean, simple website for Real Judaism podcast and blog content.

## Structure

- `index.html` - Homepage with podcast series overview
- `about.html` - About Rabbi Ari Klapper
- `blog.html` - Blog homepage with post listings
- `blog/` - Individual blog post HTML files
- `series/` - Podcast series pages
- `images/` - Images and media files
- `data/` - JSON data files for episodes and blog posts

## Scripts

### Blog Management
- `generate_blog_posts.py` - Generate HTML files from blog_posts.json
- `blog.js` - Load and display blog posts on blog.html

### Podcast Management
- `episode_detector.py` - Detect new episodes from Spotify
- `episode_update.py` - Main script to update all episodes
- `episodes.js` - Load and display episodes on series pages

## Usage

### To update blog posts:
1. Edit `data/blog_posts.json`
2. Run `python generate_blog_posts.py`

### To update podcast episodes:
1. Run `python episode_update.py` to check for new episodes
2. The script will update JSON files and HTML as needed

### To run locally:
Simply open index.html in a web browser, or use a local server.

## Features

- Plain HTML pages without complex styling
- Vanilla JavaScript for dynamic content
- JSON-based data storage
- Automated episode detection from Spotify
- Automated blog post generation
