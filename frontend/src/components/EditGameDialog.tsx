'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'

interface Game {
  id: number
  name: string
  platform: string
  type: 'physical' | 'digital'
  status?: string
  hours_played?: number
  cover_url?: string
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
  const [physical, setPhysical] = useState(false)
  const [digital, setDigital] = useState(false)
  const [status, setStatus] = useState('Backlog')
  const [hoursPlayed, setHoursPlayed] = useState('')

  useEffect(() => {
    if (game) {
      setPlatform(game.platform || '')
      setPhysical(game.type === 'physical')
      setDigital(game.type === 'digital')
      setStatus(game.status || 'Backlog')
      setHoursPlayed(Math.round(game.hours_played || 0).toString())
    }
  }, [game])

  const handleSave = () => {
    if (!platform.trim()) {
      alert('Platform cannot be empty')
      return
    }

    // Determine type based on checkboxes
    let type: 'physical' | 'digital' = 'digital'
    if (physical && !digital) {
      type = 'physical'
    } else if (!physical && digital) {
      type = 'digital'
    } else if (physical && digital) {
      type = 'digital' // Default to digital if both checked
    }

    onSave({
      platform: platform.trim(),
      type,
      status,
      hoursPlayed: hoursPlayed ? Math.round(parseFloat(hoursPlayed)) : 0,
    })
  }

  if (!game) return null

  const getPlatformOptions = () => {
    return [
      'PC',
      'PlayStation 5',
      'PlayStation 4',
      'Xbox Series X|S',
      'Xbox One',
      'Nintendo Switch',
      'Steam',
      'Xbox',
      'PlayStation',
      'Multiple'
    ]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] sm:max-w-[90vw] max-h-[90vh] overflow-y-auto !bg-white">
        <DialogHeader>
          <DialogTitle className="!text-gray-900">Edit Game</DialogTitle>
          <DialogDescription className="!text-gray-600">
            Update game details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Game Info */}
          {game.cover_url && (
            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
              <img
                src={game.cover_url}
                alt={game.name}
                className="w-20 h-28 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold text-gray-900">{game.name}</h3>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-900">Game</Label>
              <p className="text-sm font-medium text-gray-700">{game.name}</p>
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
                  placeholder="0"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
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
