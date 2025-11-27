'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Plus, Loader2 } from 'lucide-react'
import api from '@/lib/api'

interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddGame: (gameData: any) => void
}

export default function AddGameDialog({ open, onOpenChange, onAddGame }: AddGameDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState<any>(null)
  const [type, setType] = useState<'physical' | 'digital'>('digital')
  const [platform, setPlatform] = useState('PC')
  const [status, setStatus] = useState('Backlog')
  const [hoursPlayed, setHoursPlayed] = useState('')
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 3) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true)
        try {
          const res = await api.get(`/api/games/search?q=${encodeURIComponent(searchQuery)}&limit=10`)
          setSearchResults(res.data)
        } catch (error) {
          console.error('Search failed:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 500)
    } else {
      setSearchResults([])
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const handleSelectGame = (game: any) => {
    setSelectedGame(game)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleAdd = () => {
    if (!selectedGame) {
      alert('Please select a game')
      return
    }

    onAddGame({
      igdbId: selectedGame.id,
      type,
      platform,
      status,
      hoursPlayed: hoursPlayed ? parseFloat(hoursPlayed) : 0,
    })

    // Reset form
    setSelectedGame(null)
    setSearchQuery('')
    setType('digital')
    setPlatform('PC')
    setStatus('Backlog')
    setHoursPlayed('')
  }

  const getPlatformOptions = (game: any) => {
    const options = new Set<string>()
    if (Array.isArray(game?.platforms)) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Game to Library</DialogTitle>
          <DialogDescription>
            Search for a game and add it to your collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Games</Label>
            <div className="relative">
              <Input
                placeholder="Type game name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                {searchResults.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                    onClick={() => handleSelectGame(game)}
                  >
                    <div className="flex items-center gap-3">
                      {game.cover?.url && (
                        <img
                          src={`https:${game.cover.url}`}
                          alt={game.name}
                          className="w-12 h-16 object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{game.name}</p>
                        {game.first_release_date && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(game.first_release_date * 1000).getFullYear()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Game */}
          {selectedGame && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                {selectedGame.cover?.url && (
                  <img
                    src={`https:${selectedGame.cover.url}`}
                    alt={selectedGame.name}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold">{selectedGame.name}</h3>
                  {selectedGame.first_release_date && (
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedGame.first_release_date * 1000).getFullYear()}
                    </p>
                  )}
                </div>
              </div>

              {/* Game Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as 'physical' | 'digital')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="physical">Physical</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getPlatformOptions(selectedGame).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Backlog">Backlog</SelectItem>
                      <SelectItem value="Playing">Playing</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Dropped">Dropped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Hours Played</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={hoursPlayed}
                    onChange={(e) => setHoursPlayed(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Library
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

