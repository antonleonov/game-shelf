'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

export default function UpcomingReleases() {
  const [releases, setReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReleases()
  }, [])

  const loadReleases = async () => {
    try {
      const res = await api.get('/api/games/upcoming/releases?limit=50')
      setReleases(res.data)
    } catch (error) {
      console.error('Failed to load releases:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToWishlist = async (igdbId: number) => {
    try {
      await api.post('/api/wishlist', { igdbId })
      alert('Added to wishlist!')
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      alert('Failed to add to wishlist')
    }
  }

  if (loading) return <div>Loading upcoming releases...</div>

  return (
    <div>
      <h2>Upcoming Releases</h2>
      {releases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', marginTop: '24px' }}>
          <p>No upcoming releases found.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {releases.map((game: any) => (
            <div
              key={game.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {game.cover?.url && (
                <img
                  src={`https:${game.cover.url}`}
                  alt={game.name}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{game.name}</h4>
                {game.first_release_date && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                    {new Date(game.first_release_date * 1000).toLocaleDateString()}
                  </p>
                )}
                <button
                  onClick={() => addToWishlist(game.id)}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  Add to Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

