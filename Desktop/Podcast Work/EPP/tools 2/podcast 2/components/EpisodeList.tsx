'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, Search, CheckSquare, Square, Download, Clock, Calendar } from 'lucide-react'
import { SavedPodcast } from '@/lib/localStorage'
import DownloadManager from './DownloadManager'

interface EpisodeListProps {
  podcast: SavedPodcast
  onBack: () => void
}

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

export default function EpisodeList({ podcast, onBack }: EpisodeListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set())
  const [showDownloadManager, setShowDownloadManager] = useState(false)

  const episodes = podcast.episodes as Episode[]

  const filteredEpisodes = useMemo(() => {
    if (!searchTerm) return episodes
    return episodes.filter(episode =>
      episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      episode.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [episodes, searchTerm])

  const handleSelectEpisode = (guid: string) => {
    const newSelected = new Set(selectedEpisodes)
    if (newSelected.has(guid)) {
      newSelected.delete(guid)
    } else {
      newSelected.add(guid)
    }
    setSelectedEpisodes(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedEpisodes.size === filteredEpisodes.length) {
      setSelectedEpisodes(new Set())
    } else {
      setSelectedEpisodes(new Set(filteredEpisodes.map(ep => ep.guid)))
    }
  }

  const handleSelectSeason = (season: string) => {
    const seasonEpisodes = episodes.filter(ep => ep.season === season)
    const seasonGuids = seasonEpisodes.map(ep => ep.guid)
    const newSelected = new Set(selectedEpisodes)
    
    // Toggle season selection
    const allSeasonSelected = seasonGuids.every(guid => newSelected.has(guid))
    if (allSeasonSelected) {
      seasonGuids.forEach(guid => newSelected.delete(guid))
    } else {
      seasonGuids.forEach(guid => newSelected.add(guid))
    }
    
    setSelectedEpisodes(newSelected)
  }

  const formatDuration = (duration: string) => {
    if (!duration) return 'Unknown'
    const seconds = parseInt(duration)
    if (isNaN(seconds)) return duration
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const sanitizeFilename = (title: string) => {
    return title
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .toLowerCase()
      .trim()
  }

  const getUniqueSeasons = () => {
    const seasons = episodes
      .map(ep => ep.season)
      .filter((season, index, arr) => season && arr.indexOf(season) === index)
      .sort((a, b) => parseInt(a || '0') - parseInt(b || '0'))
    return seasons
  }

  const selectedEpisodesData = episodes.filter(ep => selectedEpisodes.has(ep.guid))

  if (showDownloadManager) {
    return (
      <DownloadManager
        podcast={podcast}
        episodes={selectedEpisodesData}
        onBack={() => setShowDownloadManager(false)}
      />
    )
  }

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
            Back to Podcasts
          </button>
        </div>

        {/* Podcast Info */}
        <div className="flex items-start gap-6 mb-8">
          {podcast.coverImage ? (
            <img
              src={podcast.coverImage}
              alt={podcast.title}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-3xl">🎧</span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{podcast.title}</h1>
            <p className="text-gray-400 mb-4 max-w-2xl">{podcast.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{episodes.length} episodes</span>
              {getUniqueSeasons().length > 0 && (
                <span>{getUniqueSeasons().length} seasons</span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors"
            >
              {selectedEpisodes.size === filteredEpisodes.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedEpisodes.size === filteredEpisodes.length ? 'Deselect All' : 'Select All'}
            </button>

            {getUniqueSeasons().length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Select Season:</span>
                {getUniqueSeasons().map(season => (
                  <button
                    key={season}
                    onClick={() => handleSelectSeason(season)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
                  >
                    Season {season}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {selectedEpisodes.size > 0 && (
              <button
                onClick={() => setShowDownloadManager(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Selected ({selectedEpisodes.size})
              </button>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search episodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-white"
              />
            </div>
          </div>
        </div>

        {/* Episodes List */}
        <div className="space-y-4">
          {filteredEpisodes.map((episode) => {
            const isSelected = selectedEpisodes.has(episode.guid)
            const sanitizedTitle = sanitizeFilename(episode.title)
            
            return (
              <div
                key={episode.guid}
                className={`p-4 rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-primary-900/20 border-primary-500'
                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleSelectEpisode(episode.guid)}
                    className="mt-1 text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-semibold text-lg truncate">{episode.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 whitespace-nowrap">
                        {episode.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(episode.duration)}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(episode.pubDate)}
                        </div>
                      </div>
                    </div>

                    {episode.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {episode.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {episode.season && (
                        <span>Season {episode.season}</span>
                      )}
                      {episode.episode && (
                        <span>Episode {episode.episode}</span>
                      )}
                      <span className="font-mono">{sanitizedTitle}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredEpisodes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No episodes found</h3>
              <p>Try adjusting your search terms.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
