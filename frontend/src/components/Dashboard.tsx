'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import GameLibrary from './GameLibrary'
import Wishlist from './Wishlist'
import Friends from './Friends'
import Location from './Location'
import UpcomingReleases from './UpcomingReleases'
import StatisticsCards from './StatisticsCards'
import FilterBar from './FilterBar'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Gamepad2, User, LogOut } from 'lucide-react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('library')
  const isDevMode = process.env.NEXT_PUBLIC_ENABLE_DEV_MODE === 'true'

  // Filter states for library
  const [searchTerm, setSearchTerm] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dateAdded')
  const [hasLibraryGames, setHasLibraryGames] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Dev Mode Indicator */}
      {isDevMode && (
        <div className="bg-yellow-600 text-white text-center py-1 text-xs">
          🛠️ Development Mode: Authentication bypassed
        </div>
      )}
      {/* Header */}
      <header className="border-b">
        <div
          className="container mx-auto px-4 py-6"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(/images/background.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-white">
              <Gamepad2 className="h-8 w-8" />
              <div>
                <h1 className="text-[20px] font-bold uppercase">GAME SHELF</h1>
                <p className="text-sm text-muted-foreground text-[12px]">
                  Track and organize your game collection
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {activeTab === 'library' && (
                <Button
                  onClick={() => {
                    // This will be handled by GameLibrary component
                    const event = new CustomEvent('openAddGameDialog')
                    window.dispatchEvent(event)
                  }}
                  className="bg-[#0076E8] hover:bg-[#0076E8]/90"
                >
                  + Add Game
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Statistics - only show on library tab */}
          {activeTab === 'library' && <StatisticsCards />}

          {/* Filters - only show on library tab */}
          {activeTab === 'library' && (
            <FilterBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              platformFilter={platformFilter}
              onPlatformFilterChange={setPlatformFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              hasResults={hasLibraryGames}
              onAddGame={(game) => {
                // This will be handled by GameLibrary component
                const event = new CustomEvent('addGameFromSuggestion', { detail: game })
                window.dispatchEvent(event)
              }}
            />
          )}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {[
              { id: 'library', label: 'My Library' },
              { id: 'wishlist', label: 'Wishlist' },
              { id: 'upcoming', label: 'Upcoming Releases' },
              { id: 'friends', label: 'Friends' },
              { id: 'location', label: 'Location' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#0076E8] text-foreground font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'library' && (
          <GameLibrary
            searchTerm={searchTerm}
            platformFilter={platformFilter}
            statusFilter={statusFilter}
            sortBy={sortBy}
            onFilteredGamesChange={(count) => setHasLibraryGames(count > 0)}
          />
        )}
        {activeTab === 'wishlist' && <Wishlist />}
        {activeTab === 'upcoming' && <UpcomingReleases />}
        {activeTab === 'friends' && <Friends />}
        {activeTab === 'location' && <Location />}
      </main>
    </div>
  )
}
