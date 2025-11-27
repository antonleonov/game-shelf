'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { MoreVertical, Edit, Trash2, Plus, Search } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

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
  const [showAddDialog, setShowAddDialog] = useState(false)
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
    options.add('PC')
    return Array.from(options)
  }

  const handlePlatformToggle = (gameId: number, platform: string, checked: boolean) => {
    setPlatformSelections((prev) => {
      const current = prev[gameId] || []
      if (checked) {
        return { ...prev, [gameId]: [...current, platform] }
      } else {
        return { ...prev, [gameId]: current.filter((p) => p !== platform) }
      }
    })
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
      setShowAddDialog(false)
      setSearchQuery('')
      setSearchResults([])
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">My Game Library</h2>
          <p className="text-sm text-muted-foreground mt-1">{games.length} games</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Game to Library</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchGames()}
                  className="flex-1"
                />
                <Button onClick={searchGames} type="button">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4 mt-4">
                  {searchResults.map((game: any) => {
                    const platformOptions = getPlatformOptions(game)
                    const selectedPlatforms = platformSelections[game.id] || []
                    const selectedType = typeSelections[game.id] || 'physical'

                    return (
                      <Card key={game.id}>
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            {game.cover?.url && (
                              <img
                                src={`https:${game.cover.url}`}
                                alt={game.name}
                                className="w-16 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 space-y-3">
                              <div>
                                <h4 className="font-semibold">{game.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {game.platforms?.map((p: any) => p.name).join(', ')}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Edition Type</Label>
                                <div className="flex gap-2">
                                  {(['physical', 'digital'] as const).map((type) => (
                                    <Button
                                      key={type}
                                      type="button"
                                      variant={selectedType === type ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => handleTypeSelection(game.id, type)}
                                      className="capitalize"
                                    >
                                      {type}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-xs">Platforms you own</Label>
                                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                                  {platformOptions.map((platform) => {
                                    const isChecked = selectedPlatforms.includes(platform)
                                    return (
                                      <div key={platform} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${game.id}-${platform}`}
                                          checked={isChecked}
                                          onCheckedChange={(checked) =>
                                            handlePlatformToggle(game.id, platform, checked as boolean)
                                          }
                                        />
                                        <Label
                                          htmlFor={`${game.id}-${platform}`}
                                          className="text-sm font-normal cursor-pointer"
                                        >
                                          {platform}
                                        </Label>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <Input
                                  type="text"
                                  placeholder="Add custom platform (e.g., PC, Steam Deck)"
                                  value={customPlatformInputs[game.id] || ''}
                                  onChange={(e) =>
                                    setCustomPlatformInputs((prev) => ({
                                      ...prev,
                                      [game.id]: e.target.value,
                                    }))
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      addCustomPlatform(game.id)
                                    }
                                  }}
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addCustomPlatform(game.id)}
                                >
                                  Add
                                </Button>
                              </div>

                              {selectedPlatforms.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {selectedPlatforms.map((platform) => (
                                    <Badge key={platform} variant="secondary">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <Button
                                onClick={() => handleAddSelectedPlatforms(game)}
                                disabled={selectedPlatforms.length === 0}
                                className="w-full"
                              >
                                Add {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''}` : 'selected platforms'} ({selectedType})
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {games.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">Your library is empty. Add your first game!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {game.cover_url && (
                  <img
                    src={game.cover_url}
                    alt={game.name}
                    className="w-full h-64 object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditingGame(game)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => removeGame(game.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {game.type === 'physical' && (
                  <Badge className="absolute bottom-2 left-2 bg-amber-600 text-white">
                    Physical
                  </Badge>
                )}
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-1">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">{game.platform}</p>
                </div>

                {editingGameId === game.id ? (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label className="text-xs">Platform</Label>
                      <Input
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Edition Type</Label>
                      <div className="flex gap-2">
                        {(['physical', 'digital'] as const).map((type) => (
                          <Button
                            key={type}
                            type="button"
                            variant={editType === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setEditType(type)}
                            className="flex-1 capitalize"
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveGameEdit}
                        disabled={savingEdit}
                        size="sm"
                        className="flex-1"
                      >
                        {savingEdit ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={game.type === 'physical' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {game.type}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
