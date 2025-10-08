'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Download, Moon, Sun } from 'lucide-react'
import { getStoredData, addPodcast, removePodcast, SavedPodcast } from '@/lib/localStorage'
import { PodcastData } from '@/app/api/fetch-rss/route'
import EpisodeList from './EpisodeList'

export default function Dashboard() {
  const [podcasts, setPodcasts] = useState<SavedPodcast[]>([])
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [feedUrl, setFeedUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPodcast, setSelectedPodcast] = useState<SavedPodcast | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const data = getStoredData()
    setPodcasts(data.podcasts)
  }, [])

  const handleAddPodcast = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedUrl.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/fetch-rss', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedUrl: feedUrl.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch RSS feed')
      }

      const podcastData: PodcastData = await response.json()

      const newPodcast: SavedPodcast = {
        id: `podcast-${Date.now()}`,
        title: podcastData.title,
        feedUrl: feedUrl.trim(),
        coverImage: podcastData.coverImage,
        description: podcastData.description,
        episodes: podcastData.episodes,
        lastUpdated: new Date().toISOString(),
      }

      addPodcast(newPodcast)
      setPodcasts(prev => [...prev, newPodcast])
      setFeedUrl('')
      setShowAddForm(false)
    } catch (error) {
      setError('Failed to add podcast. Please check the RSS URL.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemovePodcast = (podcastId: string) => {
    removePodcast(podcastId)
    setPodcasts(prev => prev.filter(p => p.id !== podcastId))
    if (selectedPodcast?.id === podcastId) {
      setSelectedPodcast(null)
    }
  }

  const filteredPodcasts = podcasts.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  if (selectedPodcast) {
    return (
      <EpisodeList
        podcast={selectedPodcast}
        onBack={() => setSelectedPodcast(null)}
      />
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Podcast RSS Downloader</h1>
            <p className="text-gray-500">Manage and download your favorite podcasts</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Add Podcast Form */}
        {showAddForm && (
          <div className={`mb-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <h2 className="text-xl font-semibold mb-4">Add New Podcast</h2>
            <form onSubmit={handleAddPodcast} className="space-y-4">
              <div>
                <label htmlFor="feedUrl" className="block text-sm font-medium mb-2">
                  RSS Feed URL
                </label>
                <input
                  id="feedUrl"
                  type="url"
                  value={feedUrl}
                  onChange={(e) => setFeedUrl(e.target.value)}
                  placeholder="https://example.com/podcast.rss"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                  required
                />
              </div>
              {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add Podcast'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false)
                    setFeedUrl('')
                    setError('')
                  }}
                  className={`px-6 py-2 rounded-lg border transition-colors ${
                    isDarkMode
                      ? 'border-gray-600 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Podcast
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search podcasts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>

        {/* Podcast Grid */}
        {filteredPodcasts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {podcasts.length === 0 ? (
                <>
                  <div className="text-6xl mb-4">🎧</div>
                  <h3 className="text-xl font-semibold mb-2">No podcasts yet</h3>
                  <p>Add your first podcast by clicking the "Add Podcast" button above.</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No podcasts found</h3>
                  <p>Try adjusting your search terms.</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPodcasts.map((podcast) => (
              <div
                key={podcast.id}
                className={`p-6 rounded-lg shadow-lg transition-all hover:shadow-xl cursor-pointer ${
                  isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
                }`}
                onClick={() => setSelectedPodcast(podcast)}
              >
                <div className="flex items-start gap-4 mb-4">
                  {podcast.coverImage ? (
                    <img
                      src={podcast.coverImage}
                      alt={podcast.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎧</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{podcast.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {podcast.episodes.length} episodes
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePodcast(podcast.id)
                    }}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Remove podcast"
                    aria-label="Remove podcast"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                  {podcast.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated: {new Date(podcast.lastUpdated).toLocaleDateString()}</span>
                  <Download className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
