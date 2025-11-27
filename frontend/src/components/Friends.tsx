'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Friend {
  id: number
  friend_user_id: number
  friend_name: string
  friend_email: string
  friend_picture?: string
  status: string
}

export default function Friends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [pending, setPending] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState('')

  useEffect(() => {
    loadFriends()
    loadPending()
  }, [])

  const loadFriends = async () => {
    try {
      const res = await api.get('/api/friends')
      setFriends(res.data)
    } catch (error) {
      console.error('Failed to load friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPending = async () => {
    try {
      const res = await api.get('/api/friends/pending')
      setPending(res.data)
    } catch (error) {
      console.error('Failed to load pending:', error)
    }
  }

  const sendFriendRequest = async (email: string) => {
    // In a real app, you'd search for users by email first
    alert('Friend request feature - need user search by email first')
  }

  const acceptRequest = async (id: number) => {
    try {
      await api.put(`/api/friends/accept/${id}`)
      await loadFriends()
      await loadPending()
    } catch (error) {
      console.error('Failed to accept request:', error)
    }
  }

  const removeFriend = async (id: number) => {
    if (!confirm('Remove this friend?')) return
    try {
      await api.delete(`/api/friends/${id}`)
      await loadFriends()
    } catch (error) {
      console.error('Failed to remove friend:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2>Friends ({friends.length})</h2>

      {pending.length > 0 && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginTop: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>Pending Requests ({pending.length})</h3>
          {pending.map((req) => (
            <div
              key={req.id}
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
              {req.friend_picture && (
                <img
                  src={req.friend_picture}
                  alt={req.friend_name}
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{req.friend_name}</h4>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>{req.friend_email}</p>
              </div>
              <button
                onClick={() => acceptRequest(req.id)}
                style={{
                  padding: '6px 12px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Accept
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginTop: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3>Add Friend</h3>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <input
            type="email"
            placeholder="Friend's email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px'
            }}
          />
          <button
            onClick={() => sendFriendRequest(searchEmail)}
            style={{
              padding: '10px 20px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Send Request
          </button>
        </div>
      </div>

      {friends.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', marginTop: '24px' }}>
          <p>No friends yet. Add some friends to connect!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px',
          marginTop: '24px'
        }}>
          {friends.map((friend) => (
            <div
              key={friend.id}
              style={{
                background: 'white',
                padding: '16px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {friend.friend_picture && (
                <img
                  src={friend.friend_picture}
                  alt={friend.friend_name}
                  style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0 }}>{friend.friend_name}</h4>
                <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>{friend.friend_email}</p>
              </div>
              <button
                onClick={() => removeFriend(friend.id)}
                style={{
                  padding: '6px 12px',
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
          ))}
        </div>
      )}
    </div>
  )
}

