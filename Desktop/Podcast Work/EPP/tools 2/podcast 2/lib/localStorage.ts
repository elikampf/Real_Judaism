export interface SavedPodcast {
  id: string
  title: string
  feedUrl: string
  coverImage: string
  description: string
  episodes: any[]
  lastUpdated: string
}

export interface LocalStorageData {
  podcasts: SavedPodcast[]
  isAuthenticated: boolean
  rememberAuth: boolean
}

export const STORAGE_KEY = 'podcast-downloader-data'

export function getStoredData(): LocalStorageData {
  if (typeof window === 'undefined') {
    return { podcasts: [], isAuthenticated: false, rememberAuth: false }
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error)
  }

  return { podcasts: [], isAuthenticated: false, rememberAuth: false }
}

export function saveStoredData(data: LocalStorageData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function addPodcast(podcast: SavedPodcast): void {
  const data = getStoredData()
  const existingIndex = data.podcasts.findIndex(p => p.id === podcast.id)
  
  if (existingIndex >= 0) {
    data.podcasts[existingIndex] = podcast
  } else {
    data.podcasts.push(podcast)
  }
  
  saveStoredData(data)
}

export function removePodcast(podcastId: string): void {
  const data = getStoredData()
  data.podcasts = data.podcasts.filter(p => p.id !== podcastId)
  saveStoredData(data)
}

export function setAuthentication(isAuthenticated: boolean, remember: boolean = false): void {
  const data = getStoredData()
  data.isAuthenticated = isAuthenticated
  data.rememberAuth = remember
  saveStoredData(data)
}
