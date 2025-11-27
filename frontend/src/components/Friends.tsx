'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
    if (!email.trim()) {
      alert('Please enter an email address')
      return
    }

    try {
      // First, search for the user by email
      const searchRes = await api.get(`/api/friends/search?email=${encodeURIComponent(email)}`)
      const user = searchRes.data

      // Then send the friend request
      await api.post('/api/friends/request', { friendId: user.id })
      alert(`Friend request sent to ${user.name || user.email}!`)
      setSearchEmail('')
      await loadPending()
    } catch (error: any) {
      console.error('Failed to send friend request:', error)
      const errorMessage = error?.response?.data?.error || 'Failed to send friend request'
      alert(errorMessage)
    }
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
        <h2 className="text-2xl font-bold">Friends</h2>
        <Badge variant="secondary">{friends.length} friends</Badge>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>{pending.length} pending friend requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.map((req) => {
              const name = req.name || req.friend_name || 'Unknown'
              const email = req.email || req.friend_email || ''
              const picture = req.picture || req.friend_picture
              return (
                <Card key={req.id} className="flex items-center gap-4 p-4">
                  <Avatar>
                    {picture ? (
                      <AvatarImage src={picture} alt={name} />
                    ) : null}
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{name}</h4>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                  <Button onClick={() => acceptRequest(req.id)} size="sm">
                    Accept
                  </Button>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add Friend</CardTitle>
          <CardDescription>Send a friend request by email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Friend's email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={() => sendFriendRequest(searchEmail)}>
              Send Request
            </Button>
          </div>
        </CardContent>
      </Card>

      {friends.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No friends yet. Add some friends to connect!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => {
            const name = friend.friend_name || 'Unknown'
            const email = friend.friend_email || ''
            const picture = friend.friend_picture
            return (
              <Card key={friend.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar>
                    {picture ? (
                      <AvatarImage src={picture} alt={name} />
                    ) : null}
                    <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{name}</h4>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                  <Button
                    onClick={() => removeFriend(friend.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
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
