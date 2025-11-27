'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreVertical, Edit, Trash2 } from 'lucide-react'
import AddGameDialog from './AddGameDialog'
import EditGameDialog from './EditGameDialog'

interface Game {
  id: number
  igdb_id: number
  name: string
  cover_url: string
  type: 'physical' | 'digital'
  platform: string
  status?: string
  hours_played?: number
  purchase_date?: string
  purchase_price?: number
  notes?: string
  created_at?: string
}

interface GameLibraryProps {
  searchTerm?: string
  platformFilter?: string
  statusFilter?: string
  sortBy?: string
  onFilteredGamesChange?: (count: number) => void
}

export default function GameLibrary({
  searchTerm = '',
  platformFilter = 'all',
  statusFilter = 'all',
  sortBy = 'dateAdded',
  onFilteredGamesChange,
}: GameLibraryProps) {
  const [games, setGames] = useState<Game[]>([])
  const [filteredGames, setFilteredGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingGame, setEditingGame] = useState<Game | null>(null)
  const [deletingGameId, setDeletingGameId] = useState<number | null>(null)

  useEffect(() => {
    loadLibrary()
    
    // Listen for openAddGameDialog event
    const handleOpenDialog = () => setShowAddDialog(true)
    window.addEventListener('openAddGameDialog', handleOpenDialog)
    
    // Listen for addGameFromSuggestion event
    const handleAddFromSuggestion = (e: any) => {
      const game = e.detail
      handleAddGame({
        igdbId: game.id,
        type: 'digital',
        platform: 'PC',
        status: 'Backlog',
        hoursPlayed: 0,
      })
    }
    window.addEventListener('addGameFromSuggestion', handleAddFromSuggestion)
    
    return () => {
      window.removeEventListener('openAddGameDialog', handleOpenDialog)
      window.removeEventListener('addGameFromSuggestion', handleAddFromSuggestion)
    }
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...games]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter((game) => game.name.toLowerCase().includes(term))
    }

    // Platform filter
    if (platformFilter !== 'all') {
      result = result.filter((game) => game.platform === platformFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((game) => (game.status || 'Backlog') === statusFilter)
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.name.localeCompare(b.name)
        case 'rating':
          // Note: rating is not in the Game interface yet, would need to add it
          return 0
        case 'hoursPlayed':
          return (b.hours_played || 0) - (a.hours_played || 0)
        case 'dateAdded':
        default:
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
          return dateB - dateA
      }
    })

    setFilteredGames(result)
    if (onFilteredGamesChange) {
      onFilteredGamesChange(result.length)
    }
  }, [games, searchTerm, platformFilter, statusFilter, sortBy, onFilteredGamesChange])

  const loadLibrary = async () => {
    try {
      const res = await api.get('/api/library')
      setGames(res.data)
    } catch (error) {
      console.error('Failed to load library:', error)
      // In dev mode, set empty array if API fails
      if (process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true') {
        setGames([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddGame = async (gameData: any) => {
    try {
      const { igdbId, type, platform, status, hoursPlayed } = gameData
      await api.post('/api/library', {
        igdbId,
        type,
        platform,
        status: status || 'Backlog',
        hoursPlayed: hoursPlayed || 0,
      })
      await loadLibrary()
      setShowAddDialog(false)
    } catch (error: any) {
      console.error('Failed to add game:', error)
      alert(error?.response?.data?.error || 'Failed to add game')
    }
  }

  const handleEditGame = async (gameData: any) => {
    try {
      await api.put(`/api/library/${editingGame?.id}`, gameData)
      await loadLibrary()
      setEditingGame(null)
    } catch (error: any) {
      console.error('Failed to update game:', error)
      alert(error?.response?.data?.error || 'Failed to update game')
    }
  }

  const handleDeleteGame = async (id: number) => {
    try {
      await api.delete(`/api/library/${id}`)
      await loadLibrary()
      setDeletingGameId(null)
    } catch (error) {
      console.error('Failed to delete game:', error)
    }
  }

  const statusColors: Record<string, string> = {
    Backlog: 'bg-gray-500 text-white',
    Playing: 'bg-yellow-500 text-black',
    Completed: 'bg-green-600 text-white',
    Dropped: 'bg-red-500 text-white',
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="mb-8 text-white text-[32px] font-semibold">My collection</h1>
      
      {filteredGames.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">
            {games.length === 0
              ? 'Start building your library by adding games'
              : 'No games found matching your filters'}
          </p>
          {games.length === 0 && (
            <Button onClick={() => setShowAddDialog(true)}>Add Game</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                {game.cover_url ? (
                  <img
                    src={game.cover_url}
                    alt={game.name}
                    className="w-full h-80 object-cover"
                  />
                ) : (
                  <div className="w-full h-80 bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">No cover</p>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingGame(game)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingGameId(game.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-2">
                  {game.type === 'physical' && (
                    <Badge className="bg-amber-600 text-white">Physical</Badge>
                  )}
                  {game.type === 'digital' && (
                    <Badge className="bg-blue-600 text-white">Digital</Badge>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold line-clamp-1">{game.name}</h3>
                  <p className="text-sm text-muted-foreground">{game.platform}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {game.status && (
                    <Badge className={statusColors[game.status] || statusColors.Backlog}>
                      {game.status}
                    </Badge>
                  )}
                </div>

                {game.hours_played !== undefined && game.hours_played > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {Math.round(game.hours_played)}h played
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Game Dialog */}
      <AddGameDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddGame={handleAddGame}
      />

      {/* Edit Game Dialog */}
      {editingGame && (
        <EditGameDialog
          game={editingGame}
          open={!!editingGame}
          onOpenChange={() => setEditingGame(null)}
          onSave={handleEditGame}
        />
      )}

      {/* Delete Confirmation */}
      {deletingGameId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <Card className="p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-2">Delete game?</h3>
            <p className="text-muted-foreground mb-4">
              This will permanently delete this game from your library. This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeletingGameId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteGame(deletingGameId)
                }}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
