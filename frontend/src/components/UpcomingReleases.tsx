'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function UpcomingReleases() {
  const [releases, setReleases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Helper function to get high-quality cover URL from IGDB
  const getCoverUrl = (cover: any) => {
    if (!cover?.url) return null
    // Convert t_thumb to t_cover_big for higher quality, same as backend does
    const url = cover.url.replace('t_thumb', 't_cover_big')
    return `https:${url}`
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading upcoming releases...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Upcoming Releases</h2>
      {releases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No upcoming releases found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {releases.map((game: any) => {
            const coverUrl = getCoverUrl(game.cover)
            return (
              <Card key={game.id} className="overflow-hidden">
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt={game.name}
                    className="w-full h-80 object-cover"
                  />
                )}
                <CardContent className="p-4">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">{game.name}</h4>
                  {game.first_release_date && (
                    <p className="text-xs text-muted-foreground mb-3">
                      {new Date(game.first_release_date * 1000).toLocaleDateString()}
                    </p>
                  )}
                  <Button
                    onClick={() => addToWishlist(game.id)}
                    size="sm"
                    className="w-full"
                  >
                    Add to Wishlist
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
