'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

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

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Location Settings</h2>

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Your Location</h3>
        {location ? (
          <div>
            <p>Latitude: {location.latitude}</p>
            <p>Longitude: {location.longitude}</p>
            {location.city && <p>City: {location.city}</p>}
            {location.country && <p>Country: {location.country}</p>}
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => {
                    setIsPublic(e.target.checked)
                    updatePrivacy()
                  }}
                />
                <span>Make location public for game exchange</span>
              </label>
            </div>
            <button
              onClick={requestLocation}
              style={{
                marginTop: '16px',
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Update Location
            </button>
          </div>
        ) : (
          <div>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Set your location to enable game exchange with nearby gamers
            </p>
            <button
              onClick={requestLocation}
              style={{
                padding: '10px 20px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Set Location
            </button>
          </div>
        )}
      </div>

      {location && location.is_public && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Nearby Gamers</h3>
          <button
            onClick={findNearbyUsers}
            style={{
              marginTop: '12px',
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Find Nearby Users
          </button>

          {nearbyUsers.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              {nearbyUsers.map((user) => (
                <div
                  key={user.user_id}
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
                  {user.picture && (
                    <img
                      src={user.picture}
                      alt={user.name}
                      style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0 }}>{user.name}</h4>
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

