import JSZip from 'jszip'
import { SavedPodcast } from './localStorage'
import { Episode } from '@/components/EpisodeList'

export interface DownloadProgress {
  episodeTitle: string
  status: 'pending' | 'downloading' | 'completed' | 'error'
  progress: number
  error?: string
}

export interface DownloadStats {
  totalEpisodes: number
  completedEpisodes: number
  totalSize: number
  downloadedSize: number
  estimatedTimeRemaining: number
}

export async function createPodcastZip(
  podcast: SavedPodcast,
  episodes: Episode[],
  onProgress?: (progress: DownloadProgress[]) => void
): Promise<Blob> {
  const zip = new JSZip()
  const progress: DownloadProgress[] = episodes.map(ep => ({
    episodeTitle: ep.title,
    status: 'pending',
    progress: 0
  }))

  onProgress?.(progress)

  const sanitizeFilename = (title: string) => {
    return title
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .toLowerCase()
      .trim()
  }

  const getFolderPath = (episode: Episode) => {
    const sanitizedTitle = sanitizeFilename(episode.title)
    const filename = `${sanitizedTitle}.mp3`
    
    if (episode.season) {
      return `${podcast.title}/Season ${episode.season}/${filename}`
    }
    
    return `${podcast.title}/${filename}`
  }

  // Download episodes in parallel with concurrency limit
  const concurrency = 3
  const downloadPromises: Promise<void>[] = []
  
  for (let i = 0; i < episodes.length; i += concurrency) {
    const batch = episodes.slice(i, i + concurrency)
    
    const batchPromises = batch.map(async (episode, batchIndex) => {
      const episodeIndex = i + batchIndex
      const currentProgress = progress[episodeIndex]
      
      try {
        currentProgress.status = 'downloading'
        onProgress?.(progress)

        const response = await fetch(episode.audioUrl)
        if (!response.ok) {
          throw new Error(`Failed to download: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const folderPath = getFolderPath(episode)
        
        zip.file(folderPath, arrayBuffer)
        
        currentProgress.status = 'completed'
        currentProgress.progress = 100
        onProgress?.(progress)
      } catch (error) {
        currentProgress.status = 'error'
        currentProgress.error = error instanceof Error ? error.message : 'Unknown error'
        onProgress?.(progress)
      }
    })
    
    downloadPromises.push(...batchPromises)
  }

  await Promise.all(downloadPromises)

  // Generate ZIP file
  return await zip.generateAsync({ type: 'blob' })
}

export function estimateDownloadSize(episodes: Episode[]): number {
  // Rough estimate: assume average episode is 50MB
  const averageSizeMB = 50
  return episodes.length * averageSizeMB
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`
}
