'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Download, CheckCircle, XCircle, Clock, HardDrive } from 'lucide-react'
import { SavedPodcast } from '@/lib/localStorage'
import { Episode } from './EpisodeList'
import { createPodcastZip, DownloadProgress, DownloadStats, estimateDownloadSize, formatFileSize, formatTimeRemaining } from '@/lib/zipCreator'

interface DownloadManagerProps {
  podcast: SavedPodcast
  episodes: Episode[]
  onBack: () => void
}

export default function DownloadManager({ podcast, episodes, onBack }: DownloadManagerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [progress, setProgress] = useState<DownloadProgress[]>([])
  const [downloadStats, setDownloadStats] = useState<DownloadStats>({
    totalEpisodes: episodes.length,
    completedEpisodes: 0,
    totalSize: estimateDownloadSize(episodes),
    downloadedSize: 0,
    estimatedTimeRemaining: 0
  })
  const [zipBlob, setZipBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    // Initialize progress tracking
    const initialProgress: DownloadProgress[] = episodes.map(ep => ({
      episodeTitle: ep.title,
      status: 'pending',
      progress: 0
    }))
    setProgress(initialProgress)
  }, [episodes])

  const handleDownload = async () => {
    setIsDownloading(true)
    setError('')
    
    try {
      const zipBlob = await createPodcastZip(
        podcast,
        episodes,
        (progressUpdate) => {
          setProgress(progressUpdate)
          
          // Update download stats
          const completed = progressUpdate.filter(p => p.status === 'completed').length
          const total = progressUpdate.length
          const estimatedTotalSize = estimateDownloadSize(episodes)
          const downloadedSize = (completed / total) * estimatedTotalSize
          
          setDownloadStats(prev => ({
            ...prev,
            completedEpisodes: completed,
            downloadedSize,
            estimatedTimeRemaining: completed > 0 ? 
              ((total - completed) * (Date.now() - Date.now()) / completed) : 0
          }))
        }
      )
      
      setZipBlob(zipBlob)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Download failed')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleDownloadZip = () => {
    if (!zipBlob) return
    
    const sanitizeFilename = (title: string) => {
      return title
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .trim()
    }
    
    const filename = `${sanitizeFilename(podcast.title)}-episodes.zip`
    
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const completedCount = progress.filter(p => p.status === 'completed').length
  const errorCount = progress.filter(p => p.status === 'error').length
  const totalCount = progress.length
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Episodes
          </button>
        </div>

        {/* Download Summary */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-6 mb-6">
            {podcast.coverImage ? (
              <img
                src={podcast.coverImage}
                alt={podcast.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🎧</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold mb-2">{podcast.title}</h1>
              <p className="text-gray-400 mb-4">Preparing download for {episodes.length} episodes</p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  {formatFileSize(downloadStats.totalSize * 1024 * 1024)} estimated
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {downloadStats.estimatedTimeRemaining > 0 && 
                    formatTimeRemaining(downloadStats.estimatedTimeRemaining)
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-400">
                {completedCount}/{totalCount} episodes ({Math.round(overallProgress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full progress-bar"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Download Controls */}
          <div className="flex items-center gap-4">
            {!isDownloading && !zipBlob && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Start Download
              </button>
            )}

            {zipBlob && (
              <button
                onClick={handleDownloadZip}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
                Download ZIP File
              </button>
            )}

            {isDownloading && (
              <div className="flex items-center gap-2 text-primary-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-400"></div>
                Downloading episodes...
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Episode Progress List */}
        <div className="space-y-3">
          <h2 className="text-xl font-semibold mb-4">Episode Progress</h2>
          {progress.map((episodeProgress, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {episodeProgress.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {episodeProgress.status === 'error' && (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  {episodeProgress.status === 'downloading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-400"></div>
                  )}
                  {episodeProgress.status === 'pending' && (
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                  )}
                  <span className="font-medium truncate">{episodeProgress.episodeTitle}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {episodeProgress.status === 'completed' && 'Completed'}
                  {episodeProgress.status === 'error' && 'Error'}
                  {episodeProgress.status === 'downloading' && 'Downloading...'}
                  {episodeProgress.status === 'pending' && 'Pending'}
                </span>
              </div>

              {episodeProgress.status === 'downloading' && (
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-primary-600 h-1 rounded-full progress-bar"
                    style={{ width: `${episodeProgress.progress}%` }}
                  />
                </div>
              )}

              {episodeProgress.error && (
                <div className="mt-2 text-sm text-red-400">
                  Error: {episodeProgress.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Download Complete Summary */}
        {zipBlob && (
          <div className="mt-8 bg-green-900/20 border border-green-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Download Complete!</h3>
            </div>
            <p className="text-gray-300 mb-4">
              All episodes have been downloaded and packaged into a ZIP file. 
              The file is organized with the folder structure: <code className="bg-gray-700 px-2 py-1 rounded">
                PodcastName/Season X/episode-title.mp3
              </code>
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>File size: {formatFileSize(zipBlob.size)}</span>
              <span>Episodes: {completedCount}</span>
              {errorCount > 0 && (
                <span className="text-red-400">Errors: {errorCount}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
