'use client'

import { useEffect, useState } from 'react'
import api from '@/lib/api'

interface Stats {
  total_games: number
  completed: number
  playing: number
  total_hours: number
}

export default function StatisticsCards() {
  const [stats, setStats] = useState<Stats>({
    total_games: 0,
    completed: 0,
    playing: 0,
    total_hours: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await api.get('/api/library/stats')
      setStats(res.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
      // In dev mode, set default stats if API fails
      if (process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true') {
        setStats({
          total_games: 0,
          completed: 0,
          playing: 0,
          total_hours: 0,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#424652] p-4 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-8 bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <div className="bg-[#424652] p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground mb-1">Total Games</p>
        <p className="text-2xl text-white font-semibold">{stats.total_games}</p>
      </div>
      <div className="bg-[#424652] p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground mb-1">Completed</p>
        <p className="text-2xl text-white font-semibold">{stats.completed}</p>
      </div>
      <div className="bg-[#424652] p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground mb-1">Playing</p>
        <p className="text-2xl text-white font-semibold">{stats.playing}</p>
      </div>
      <div className="bg-[#424652] p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground mb-1">Total Hours</p>
        <p className="text-2xl text-white font-semibold">{Math.round(Number(stats.total_hours))}</p>
      </div>
    </div>
  )
}

