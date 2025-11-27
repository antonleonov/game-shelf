'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface WishlistItem {
  id: number
  igdb_id: number
  name: string
  cover_url: string
  release_date?: string
  priority: number
  notes?: string
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  useEffect(() => {
    loadWishlist()
  }, [])

  const loadWishlist = async () => {
    try {
      const res = await api.get('/api/wishlist')
      setItems(res.data)
    } catch (error) {
      console.error('Failed to load wishlist:', error)
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

  const addToWishlist = async (igdbId: number) => {
    try {
      await api.post('/api/wishlist', { igdbId })
      await loadWishlist()
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Failed to add to wishlist:', error)
      alert('Failed to add to wishlist')
    }
  }

  const removeFromWishlist = async (id: number) => {
    try {
      await api.delete(`/api/wishlist/${id}`)
      await loadWishlist()
    } catch (error) {
      console.error('Failed to remove from wishlist:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>My Wishlist ({items.length})</h2>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Add to Wishlist</h3>
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
                  {game.first_release_date && (
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                      Release: {new Date(game.first_release_date * 1000).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => addToWishlist(game.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Add to Wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', marginTop: '24px' }}>
          <p>Your wishlist is empty. Add games you want to play!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.name}
                  style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                />
              )}
              <div style={{ padding: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{item.name}</h4>
                {item.release_date && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                    {new Date(item.release_date).toLocaleDateString()}
                  </p>
                )}
                <button
                  onClick={() => removeFromWishlist(item.id)}
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

