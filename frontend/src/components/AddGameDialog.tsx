'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Checkbox } from './ui/checkbox'
import { Plus, Loader2, Search } from 'lucide-react'
import api from '@/lib/api'

interface AddGameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddGame: (gameData: any) => void
}

export default function AddGameDialog({ open, onOpenChange, onAddGame }: AddGameDialogProps) {
  const [showSearch, setShowSearch] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState<any>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [platform, setPlatform] = useState('PC')
  const [physical, setPhysical] = useState(false)
  const [digital, setDigital] = useState(true)
  const [status, setStatus] = useState('Backlog')
  const [rating, setRating] = useState('')
  const [genre, setGenre] = useState('')
  const [releaseYear, setReleaseYear] = useState('')
  const [hoursPlayed, setHoursPlayed] = useState('')

  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setShowSearch(true)
      setSearchQuery('')
      setSearchResults([])
      setSelectedGame(null)
      setTitle('')
      setDescription('')
      setCoverUrl('')
      setPlatform('PC')
      setPhysical(false)
      setDigital(true)
      setStatus('Backlog')
      setRating('')
      setGenre('')
      setReleaseYear('')
      setHoursPlayed('')
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
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
  }

  const handleSelectGame = (game: any) => {
    setSelectedGame(game)
    setTitle(game.name || '')
    setDescription(game.summary || '')
    setCoverUrl(game.cover?.url ? `https:${game.cover.url}` : '')
    setGenre(game.genres?.map((g: any) => g.name || g).join(', ') || '')
    if (game.first_release_date) {
      setReleaseYear(new Date(game.first_release_date * 1000).getFullYear().toString())
    }
    if (game.platforms && game.platforms.length > 0) {
      const firstPlatform = game.platforms[0]
      setPlatform(typeof firstPlatform === 'object' ? firstPlatform.name : firstPlatform)
    }
    setShowSearch(false)
    setSearchResults([])
  }

  const handleAdd = () => {
    if (!title.trim()) {
      alert('Please enter a game title')
      return
    }

    if (!selectedGame) {
      alert('Please search and select a game first')
      return
    }

    onAddGame({
      igdbId: selectedGame.id,
      type: physical && digital ? 'digital' : (physical ? 'physical' : 'digital'),
      platform,
      status,
      hoursPlayed: hoursPlayed ? Math.round(parseFloat(hoursPlayed)) : 0,
    })

    onOpenChange(false)
  }

  const getPlatformOptions = () => {
    const options = new Set<string>()
    if (selectedGame?.platforms) {
      selectedGame.platforms.forEach((platform: any) => {
        if (typeof platform === 'object' && platform?.name) {
          options.add(platform.name)
        } else if (typeof platform === 'string') {
          options.add(platform)
        }
      })
    }
    options.add('PC')
    options.add('PlayStation 5')
    options.add('PlayStation 4')
    options.add('Xbox Series X|S')
    options.add('Xbox One')
    options.add('Nintendo Switch')
    return Array.from(options)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`w-[90vw] max-w-[90vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto ${!showSearch ? '!bg-white' : ''}`}>
        <DialogHeader>
          <DialogTitle className={!showSearch ? '!text-gray-900' : ''}>Add Game to Library</DialogTitle>
          <DialogDescription className={!showSearch ? '!text-gray-600' : ''}>
            {showSearch 
              ? 'Search for a game and add it to your collection'
              : 'Search SteamGridDB for professional game covers or enter details manually.'
            }
          </DialogDescription>
        </DialogHeader>

        {showSearch ? (
          <div className="space-y-4">
            {/* Search Section */}
            <div className="space-y-2">
              <Label>Search Games</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
                  <Input
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-9 bg-[#424652] text-white placeholder:text-white/60 border-[#424652]"
                  />
                </div>
                <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Search Results */}
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

            {searchResults.length === 0 && searchQuery && !isSearching && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No games found. Try a different search term.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selected Game Info */}
            {selectedGame && (
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
                {selectedGame.cover?.url && (
                  <img
                    src={`https:${selectedGame.cover.url}`}
                    alt={selectedGame.name}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedGame.name}</h3>
                  {selectedGame.first_release_date && (
                    <p className="text-sm text-gray-600">
                      {new Date(selectedGame.first_release_date * 1000).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-900">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter game title (cover will auto-fetch)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-900">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter game description"
                  rows={3}
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverUrl" className="text-gray-900">Cover Image URL (Optional)</Label>
                <Input
                  id="coverUrl"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Cover URL from search or paste your own"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-gray-900">Platform *</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="bg-white text-gray-900 border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getPlatformOptions().map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-900">Type *</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="physical"
                        checked={physical}
                        onCheckedChange={(checked) => setPhysical(checked === true)}
                      />
                      <Label htmlFor="physical" className="cursor-pointer text-gray-900">Physical</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="digital"
                        checked={digital}
                        onCheckedChange={(checked) => setDigital(checked === true)}
                      />
                      <Label htmlFor="digital" className="cursor-pointer text-gray-900">Digital</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-gray-900">Status *</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status" className="bg-white text-gray-900 border-gray-300">
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
                  <Label htmlFor="rating" className="text-gray-900">Rating (1-10)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    placeholder="Optional"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genre" className="text-gray-900">Genre</Label>
                  <Input
                    id="genre"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="e.g., RPG, FPS, Action"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="releaseYear" className="text-gray-900">Release Year</Label>
                  <Input
                    id="releaseYear"
                    type="number"
                    min="1970"
                    max={new Date().getFullYear() + 5}
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    placeholder="Optional"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-gray-900">Hours Played</Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    step="1"
                    value={hoursPlayed}
                    onChange={(e) => {
                      const value = e.target.value
                      // Only allow integers
                      if (value === '' || /^\d+$/.test(value)) {
                        setHoursPlayed(value)
                      }
                    }}
                    placeholder="Optional"
                    className="bg-white text-gray-900 border-gray-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={() => setShowSearch(true)}>
                Back to Search
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!title.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add to Library
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
