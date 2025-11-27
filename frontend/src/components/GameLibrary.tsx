'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Game {
  id: number
  igdb_id: number
  name: string
  cover_url: string
  type: 'physical' | 'digital'
  platform: string
  purchase_date?: string
  purchase_price?: number
}

export default function GameLibrary() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    loadLibrary()
  }, [])

  const loadLibrary = async () => {
    try {
      const res = await api.get('/api/library')
      setGames(res.data)
    } catch (error) {
      console.error('Failed to load library:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchGames = async () => {
    if (!searchQuery.trim()) return
    try {
      const res = await api.get(`/api/games/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchResults(res.data)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }

  const addGame = async (igdbId: number, type: 'physical' | 'digital', platform: string) => {
    try {
      await api.post('/api/library', { igdbId, type, platform })
      await loadLibrary()
      setShowAddForm(false)
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Failed to add game:', error)
      alert('Failed to add game')
    }
  }

  const removeGame = async (id: number) => {
    if (!confirm('Remove this game from your library?')) return
    try {
      await api.delete(`/api/library/${id}`)
      await loadLibrary()
    } catch (error) {
      console.error('Failed to remove game:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>My Game Library ({games.length})</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Add Game
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Add Game to Library</h3>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchGames()}
              style={{
                flex: 1,
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px'
              }}
            />
            <button
              onClick={searchGames}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              {searchResults.map((game: any) => (
                <div
                  key={game.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    marginTop: '8px'
                  }}
                >
                  {game.cover?.url && (
                    <img
                      src={`https:${game.cover.url}`}
                      alt={game.name}
                      style={{ width: '60px', height: '80px', objectFit: 'cover' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{game.name}</h4>
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                      {game.platforms?.map((p: any) => p.name).join(', ')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => addGame(game.id, 'physical', game.platforms?.[0]?.name || 'Unknown')}
                      style={{
                        padding: '6px 12px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add Physical
                    </button>
                    <button
                      onClick={() => addGame(game.id, 'digital', game.platforms?.[0]?.name || 'Unknown')}
                      style={{
                        padding: '6px 12px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Add Digital
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {games.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>Your library is empty. Add your first game!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          {games.map((game) => (
            <div
              key={game.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {game.cover_url && (
                <img
                  src={game.cover_url}
                  alt={game.name}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{game.name}</h4>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  {game.platform}
                </p>
                <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                  <span style={{
                    padding: '2px 8px',
                    background: game.type === 'physical' ? '#fef3c7' : '#dbeafe',
                    color: game.type === 'physical' ? '#92400e' : '#1e40af',
                    borderRadius: '4px',
                    fontSize: '10px',
                    textTransform: 'uppercase'
                  }}>
                    {game.type}
                  </span>
                </div>
                <button
                  onClick={() => removeGame(game.id)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    width: '100%'
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

