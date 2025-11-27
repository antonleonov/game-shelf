'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Search } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Wishlist</h2>
        <Badge variant="secondary">{items.length} games</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add to Wishlist</CardTitle>
          <CardDescription>Search for games to add to your wishlist</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
              <Input
                type="text"
                placeholder="Q Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchGames()}
                className="pl-9 bg-[#424652] text-white placeholder:text-white/60 border-[#424652]"
              />
            </div>
            <Button onClick={searchGames}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {searchResults.map((game: any) => (
                <Card key={game.id} className="flex items-center gap-4 p-4">
                  {game.cover?.url && (
                    <img
                      src={`https:${game.cover.url}`}
                      alt={game.name}
                      className="w-15 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold">{game.name}</h4>
                    {game.first_release_date && (
                      <p className="text-sm text-muted-foreground">
                        Release: {new Date(game.first_release_date * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button onClick={() => addToWishlist(game.id)} size="sm">
                    Add to Wishlist
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Your wishlist is empty. Add games you want to play!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h4>
                {item.release_date && (
                  <p className="text-xs text-muted-foreground mb-3">
                    {new Date(item.release_date).toLocaleDateString()}
                  </p>
                )}
                <Button
                  onClick={() => removeFromWishlist(item.id)}
                  variant="destructive"
                  size="sm"
                  className="w-full"
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
