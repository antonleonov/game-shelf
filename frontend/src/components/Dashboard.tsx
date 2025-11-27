'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import api from '@/lib/api'
import GameLibrary from './GameLibrary'
import Wishlist from './Wishlist'
import Friends from './Friends'
import Location from './Location'
import UpcomingReleases from './UpcomingReleases'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('library')

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        padding: '16px 24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Game Shelf</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#666' }}>{user?.name}</span>
          {user?.picture && (
            <img
              src={user.picture}
              alt={user.name}
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          )}
          <button
            onClick={logout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        gap: '8px',
        padding: '0 24px'
      }}>
        {[
          { id: 'library', label: 'My Library' },
          { id: 'wishlist', label: 'Wishlist' },
          { id: 'upcoming', label: 'Upcoming Releases' },
          { id: 'friends', label: 'Friends' },
          { id: 'location', label: 'Location' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              background: activeTab === tab.id ? '#667eea' : 'transparent',
              color: activeTab === tab.id ? 'white' : '#666',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #667eea' : '2px solid transparent',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400'
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'library' && <GameLibrary />}
        {activeTab === 'wishlist' && <Wishlist />}
        {activeTab === 'upcoming' && <UpcomingReleases />}
        {activeTab === 'friends' && <Friends />}
        {activeTab === 'location' && <Location />}
      </main>
    </div>
  )
}

