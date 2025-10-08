import { NextRequest, NextResponse } from 'next/server'
import { parseString } from 'xml2js'

export interface Episode {
  title: string
  description: string
  pubDate: string
  duration: string
  audioUrl: string
  guid: string
  season?: string
  episode?: string
}

export interface PodcastData {
  title: string
  description: string
  coverImage: string
  episodes: Episode[]
}

export async function POST(request: NextRequest) {
  try {
    const { feedUrl } = await request.json()

    if (!feedUrl) {
      return NextResponse.json(
        { error: 'Feed URL is required' },
        { status: 400 }
      )
    }

    // Fetch RSS feed
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PodcastRSSDownloader/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }

    const xmlData = await response.text()

    // Parse XML
    const result = await new Promise((resolve, reject) => {
      parseString(xmlData, (err, result) => {
        if (err) reject(err)
        else resolve(result)
      })
    })

    const rss = result as any
    const channel = rss.rss?.channel?.[0] || rss.feed

    if (!channel) {
      throw new Error('Invalid RSS feed format')
    }

    // Extract podcast metadata
    const podcastData: PodcastData = {
      title: channel.title?.[0] || 'Unknown Podcast',
      description: channel.description?.[0] || channel.summary?.[0] || '',
      coverImage: channel.image?.[0]?.url?.[0] || channel['itunes:image']?.[0]?.$?.href || '',
      episodes: [],
    }

    // Extract episodes
    const items = channel.item || channel.entry || []
    
    podcastData.episodes = items.map((item: any) => {
      const enclosure = item.enclosure?.[0] || item.link?.[0]
      const audioUrl = enclosure?.$?.url || enclosure?.href || item.link?.[0]?.$?.href || ''

      // Extract season/episode info
      let season: string | undefined
      let episode: string | undefined
      
      if (item['itunes:episode']?.[0]) {
        episode = item['itunes:episode']?.[0]
      }
      if (item['itunes:season']?.[0]) {
        season = item['itunes:season']?.[0]
      }

      return {
        title: item.title?.[0] || 'Unknown Episode',
        description: item.description?.[0] || item.summary?.[0] || '',
        pubDate: item.pubDate?.[0] || item.published?.[0] || '',
        duration: item['itunes:duration']?.[0] || '',
        audioUrl,
        guid: item.guid?.[0]?._ || item.guid?.[0] || item.id?.[0] || '',
        season,
        episode,
      }
    })

    return NextResponse.json(podcastData)
  } catch (error) {
    console.error('RSS fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch or parse RSS feed' },
      { status: 500 }
    )
  }
}
