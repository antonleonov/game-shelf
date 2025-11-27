'use client'

import { useAuth } from '@/lib/auth'
import Login from '@/components/Login'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  const { user, loading } = useAuth()
  const isDevMode = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true'

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  // In dev mode, always show Dashboard (auth provider sets mock user)
  // Otherwise, require authentication
  if (!isDevMode && !user) {
    return <Login />
  }

  return <Dashboard />
}

