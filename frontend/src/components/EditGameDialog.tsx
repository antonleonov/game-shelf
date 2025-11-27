'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Game {
  id: number
  name: string
  platform: string
  type: 'physical' | 'digital'
  status?: string
  hours_played?: number
}

interface EditGameDialogProps {
  game: Game | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (gameData: any) => void
}

export default function EditGameDialog({
  game,
  open,
  onOpenChange,
  onSave,
}: EditGameDialogProps) {
  const [platform, setPlatform] = useState('')
  const [type, setType] = useState<'physical' | 'digital'>('digital')
  const [status, setStatus] = useState('Backlog')
  const [hoursPlayed, setHoursPlayed] = useState('')

  useEffect(() => {
    if (game) {
      setPlatform(game.platform || '')
      setType(game.type || 'digital')
      setStatus(game.status || 'Backlog')
      setHoursPlayed(game.hours_played?.toString() || '0')
    }
  }, [game])

  const handleSave = () => {
    if (!platform.trim()) {
      alert('Platform cannot be empty')
      return
    }

    onSave({
      platform: platform.trim(),
      type,
      status,
      hoursPlayed: hoursPlayed ? parseFloat(hoursPlayed) : 0,
    })
  }

  if (!game) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Game</DialogTitle>
          <DialogDescription>Update game details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Game</Label>
            <p className="text-sm font-medium">{game.name}</p>
          </div>

          <div className="space-y-2">
            <Label>Platform</Label>
            <Input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Platform"
            />
          </div>

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

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

