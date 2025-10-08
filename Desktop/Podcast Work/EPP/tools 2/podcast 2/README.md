# Podcast RSS Downloader

A personal podcast RSS downloader web app built with Next.js 14, TypeScript, and Tailwind CSS. Download and organize podcast episodes from RSS feeds into ZIP files.

## Features

- **Password Protection**: Secure access with environment variable password
- **RSS Feed Management**: Add and manage multiple podcast RSS feeds
- **Episode Browsing**: View episodes with search and filtering capabilities
- **Smart Downloads**: Download selected episodes with organized folder structure
- **Progress Tracking**: Real-time download progress with error handling
- **Dark Mode**: Clean, modern UI with dark/light mode toggle
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Storage**: localStorage for client-side data persistence
- **ZIP Creation**: JSZip for organizing downloads
- **RSS Parsing**: xml2js for RSS feed parsing
- **Deployment**: Netlify with serverless functions

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd podcast-rss-downloader
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
echo "PASSWORD=your-secure-password-here" > .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Netlify

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Netlify**:
   - Connect your repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Add environment variable: `PASSWORD=your-secure-password-here`

3. **Configure Netlify**:
   - The `netlify.toml` file is already configured
   - Environment variables are set in the Netlify dashboard
   - Serverless functions are automatically deployed

## Usage

1. **Access the App**: Enter your password on the homepage
2. **Add Podcasts**: Click "Add Podcast" and enter RSS feed URLs
3. **Browse Episodes**: Click on a podcast to view all available episodes
4. **Select Episodes**: Use checkboxes to select episodes for download
5. **Download**: Click "Download Selected" to create and download a ZIP file

## File Organization

Downloaded episodes are organized in the following structure:
```
PodcastName/
├── Season 1/
│   ├── episode-1-title.mp3
│   └── episode-2-title.mp3
├── Season 2/
│   ├── episode-3-title.mp3
│   └── episode-4-title.mp3
└── episode-title.mp3 (if no season info)
```

## API Endpoints

- `POST /api/fetch-rss`: Fetch and parse RSS feeds
- `POST /api/check-password`: Validate password authentication

## Environment Variables

- `PASSWORD`: Required password for app access (set in Netlify dashboard)

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for personal use only. Please respect podcast creators' rights and terms of service when downloading content.

## Troubleshooting

### Common Issues

1. **RSS Feed Not Loading**: Check if the RSS URL is valid and accessible
2. **Download Failures**: Some podcasts may have restricted access or require authentication
3. **Large Downloads**: Consider downloading episodes in smaller batches for better performance
4. **CORS Errors**: The app uses serverless functions to avoid CORS issues

### Support

For issues or questions, please check the GitHub issues page or create a new issue with detailed information about the problem.
