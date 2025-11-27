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
  const [typeSelections, setTypeSelections] = useState<Record<number, 'physical' | 'digital'>>({})
  const [platformSelections, setPlatformSelections] = useState<Record<number, string[]>>({})
  const [customPlatformInputs, setCustomPlatformInputs] = useState<Record<number, string>>({})
  const [editingGameId, setEditingGameId] = useState<number | null>(null)
  const [editPlatform, setEditPlatform] = useState('')
  const [editType, setEditType] = useState<'physical' | 'digital'>('physical')
  const [savingEdit, setSavingEdit] = useState(false)

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

  const getPlatformOptions = (game: any) => {
    const options = new Set<string>()
    if (Array.isArray(game.platforms)) {
      game.platforms.forEach((platform: any) => {
        if (typeof platform === 'object' && platform?.name) {
          options.add(platform.name)
        } else if (typeof platform === 'string') {
          options.add(platform)
        }
      })
    }
    // Always allow PC as a fallback option
    options.add('PC')
    return Array.from(options)
  }

  const handlePlatformSelectChange = (gameId: number, values: string[]) => {
    setPlatformSelections((prev) => ({
      ...prev,
      [gameId]: values,
    }))
  }

  const handleTypeSelection = (gameId: number, type: 'physical' | 'digital') => {
    setTypeSelections((prev) => ({
      ...prev,
      [gameId]: type,
    }))
  }

  const addCustomPlatform = (gameId: number) => {
    const value = (customPlatformInputs[gameId] || '').trim()
    if (!value) return

    setPlatformSelections((prev) => {
      const current = prev[gameId] || []
      if (current.includes(value)) {
        return prev
      }
      return {
        ...prev,
        [gameId]: [...current, value],
      }
    })

    setCustomPlatformInputs((prev) => ({
      ...prev,
      [gameId]: '',
    }))
  }

  const handleAddSelectedPlatforms = async (game: any) => {
    const igdbId = game.id
    const selectedPlatforms = platformSelections[igdbId] || []
    if (selectedPlatforms.length === 0) {
      alert('Select at least one platform you own for this game.')
      return
    }

    const type = typeSelections[igdbId] || 'physical'

    try {
      await Promise.all(
        selectedPlatforms.map((platform) =>
          api.post('/api/library', { igdbId, type, platform })
        )
      )
      await loadLibrary()
      setPlatformSelections((prev) => ({ ...prev, [igdbId]: [] }))
      setCustomPlatformInputs((prev) => ({ ...prev, [igdbId]: '' }))
    } catch (error: any) {
      console.error('Failed to add game:', error)
      alert(error?.response?.data?.error || 'Failed to add game')
    }
  }

  const startEditingGame = (game: Game) => {
    setEditingGameId(game.id)
    setEditPlatform(game.platform)
    setEditType(game.type)
  }

  const cancelEditing = () => {
    setEditingGameId(null)
    setEditPlatform('')
    setEditType('physical')
  }

  const saveGameEdit = async () => {
    if (!editingGameId) return
    const platformValue = editPlatform.trim()
    if (!platformValue) {
      alert('Platform cannot be empty')
      return
    }

    setSavingEdit(true)
    try {
      await api.put(`/api/library/${editingGameId}`, {
        platform: platformValue,
        type: editType,
      })
      await loadLibrary()
      cancelEditing()
    } catch (error: any) {
      console.error('Failed to update game:', error)
      alert(error?.response?.data?.error || 'Failed to update game')
    } finally {
      setSavingEdit(false)
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
              {searchResults.map((game: any) => {
                const platformOptions = getPlatformOptions(game)
                const selectedPlatforms = platformSelections[game.id] || []
                const selectedType = typeSelections[game.id] || 'physical'

                return (
                  <div
                    key={game.id}
                    style={{
                      display: 'flex',
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
                      <div style={{ marginTop: '8px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#555' }}>
                          Choose the editions you own:
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          {(['physical', 'digital'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => handleTypeSelection(game.id, type)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ddd',
                                background: selectedType === type ? '#4f46e5' : 'white',
                                color: selectedType === type ? 'white' : '#333',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textTransform: 'capitalize'
                              }}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <label style={{ fontSize: '12px', color: '#555' }}>Platforms you own</label>
                        <select
                          multiple
                          value={selectedPlatforms}
                          onChange={(e) =>
                            handlePlatformSelectChange(
                              game.id,
                              Array.from(e.target.selectedOptions, (option) => option.value)
                            )
                          }
                          style={{
                            width: '100%',
                            minHeight: '80px',
                            borderRadius: '6px',
                            border: '1px solid #ddd',
                            padding: '6px',
                            marginTop: '4px'
                          }}
                        >
                          {platformOptions.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <input
                            type="text"
                            placeholder="Add custom platform (e.g., PC, Steam Deck)"
                            value={customPlatformInputs[game.id] || ''}
                            onChange={(e) =>
                              setCustomPlatformInputs((prev) => ({ ...prev, [game.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addCustomPlatform(game.id)
                              }
                            }}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #ddd'
                            }}
                          />
                          <button
                            onClick={() => addCustomPlatform(game.id)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '4px',
                              border: 'none',
                              background: '#6b7280',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Add
                          </button>
                        </div>
                        {selectedPlatforms.length > 0 && (
                          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {selectedPlatforms.map((platform) => (
                              <span
                                key={platform}
                                style={{
                                  padding: '2px 8px',
                                  background: '#e0e7ff',
                                  color: '#312e81',
                                  borderRadius: '9999px',
                                  fontSize: '11px'
                                }}
                              >
                                {platform}
                              </span>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddSelectedPlatforms(game)}
                          disabled={selectedPlatforms.length === 0}
                          style={{
                            marginTop: '10px',
                            padding: '8px 12px',
                            background: selectedPlatforms.length === 0 ? '#a7f3d0' : '#10b981',
                            color: selectedPlatforms.length === 0 ? '#064e3b' : 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: selectedPlatforms.length === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Add {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}` : 'selected platforms'} ({selectedType})
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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

                {editingGameId === game.id ? (
                  <div style={{ marginTop: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                      Platform
                    </label>
                    <input
                      value={editPlatform}
                      onChange={(e) => setEditPlatform(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        marginBottom: '8px'
                      }}
                    />
                    <label style={{ display: 'block', fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                      Edition type
                    </label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      {(['physical', 'digital'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setEditType(type)}
                          style={{
                            flex: 1,
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            background: editType === type ? '#4f46e5' : 'white',
                            color: editType === type ? 'white' : '#333',
                            cursor: 'pointer',
                            fontSize: '12px',
                            textTransform: 'capitalize'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={saveGameEdit}
                        disabled={savingEdit}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: savingEdit ? 'not-allowed' : 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          flex: 1,
                          padding: '6px',
                          background: '#e5e7eb',
                          color: '#111827',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => startEditingGame(game)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeGame(game.id)}
                      style={{
                        flex: 1,
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

