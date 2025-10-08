'use client'

import { useState } from 'react'
import PasswordGate from '@/components/PasswordGate'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleAuthenticated = () => {
    setIsAuthenticated(true)
  }

  if (!isAuthenticated) {
    return <PasswordGate onAuthenticated={handleAuthenticated} />
  }

  return <Dashboard />
}
