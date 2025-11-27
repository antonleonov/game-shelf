'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MapPin } from 'lucide-react'

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-muted rounded-lg flex items-center justify-center">Loading map...</div>
})

interface Location {
  id: number
  latitude: number
  longitude: number
  city?: string
  country?: string
  is_public: boolean
}

export default function Location() {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([])
  const [isPublic, setIsPublic] = useState(false)

  useEffect(() => {
    loadLocation()
  }, [])

  const loadLocation = async () => {
    try {
      const res = await api.get('/api/location')
      if (res.data) {
        setLocation(res.data)
        setIsPublic(res.data.is_public)
      }
    } catch (error) {
      console.error('Failed to load location:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          
          // Reverse geocoding would be done here in production
          const res = await api.post('/api/location', {
            latitude,
            longitude,
            isPublic: isPublic
          })
          setLocation(res.data)
          alert('Location saved!')
        } catch (error) {
          console.error('Failed to save location:', error)
          alert('Failed to save location')
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        alert('Failed to get location')
      }
    )
  }

  const updatePrivacy = async () => {
    try {
      const res = await api.put('/api/location/privacy', { isPublic })
      setLocation(res.data)
    } catch (error) {
      console.error('Failed to update privacy:', error)
    }
  }

  const findNearbyUsers = async () => {
    if (!location) {
      alert('Please set your location first')
      return
    }
    try {
      const res = await api.get(
        `/api/location/nearby?latitude=${location.latitude}&longitude=${location.longitude}&radius=50`
      )
      setNearbyUsers(res.data)
    } catch (error) {
      console.error('Failed to find nearby users:', error)
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
      <h2 className="text-2xl font-bold">Location Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Your Location
          </CardTitle>
          <CardDescription>
            Set your location to enable game exchange with nearby gamers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {location ? (
            <>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">Latitude:</span> {location.latitude}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Longitude:</span> {location.longitude}
                </p>
                {location.city && (
                  <p className="text-sm">
                    <span className="font-semibold">City:</span> {location.city}
                  </p>
                )}
                {location.country && (
                  <p className="text-sm">
                    <span className="font-semibold">Country:</span> {location.country}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="privacy"
                  checked={isPublic}
                  onCheckedChange={(checked) => {
                    setIsPublic(checked)
                    updatePrivacy()
                  }}
                />
                <Label htmlFor="privacy">Make location public for game exchange</Label>
              </div>
              <Button onClick={requestLocation}>
                Update Location
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Set your location to enable game exchange with nearby gamers
              </p>
              <Button onClick={requestLocation}>
                Set Location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map Display */}
      {location && (
        <Card>
          <CardHeader>
            <CardTitle>Map View</CardTitle>
            <CardDescription>Your location and nearby gamers on the map</CardDescription>
          </CardHeader>
          <CardContent>
            <MapComponent
              userLocation={location}
              nearbyUsers={nearbyUsers}
            />
          </CardContent>
        </Card>
      )}

      {location && location.is_public && (
        <Card>
          <CardHeader>
            <CardTitle>Nearby Gamers</CardTitle>
            <CardDescription>Find gamers near you for game exchange</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={findNearbyUsers} variant="outline">
              Find Nearby Users
            </Button>

            {nearbyUsers.length > 0 && (
              <div className="space-y-2">
                {nearbyUsers.map((user) => (
                  <Card key={user.user_id} className="flex items-center gap-4 p-4">
                    <Avatar>
                      {user.picture ? (
                        <AvatarImage src={user.picture} alt={user.name} />
                      ) : null}
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
