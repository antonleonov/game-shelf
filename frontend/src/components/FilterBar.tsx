'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Search, Loader2, Plus } from 'lucide-react'
import api from '@/lib/api'
import { Button } from './ui/button'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  platformFilter: string
  onPlatformFilterChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  sortBy: string
  onSortByChange: (value: string) => void
  hasResults: boolean
  onAddGame?: (game: any) => void
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  platformFilter,
  onPlatformFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  hasResults,
  onAddGame,
}: FilterBarProps) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Fetch suggestions when search has no results
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Only search if there's a search term (at least 3 chars), no results, and filters are at default
    if (searchTerm.trim().length >= 3 && !hasResults && platformFilter === 'all' && statusFilter === 'all') {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true)
        try {
          const res = await api.get(`/api/games/search?q=${encodeURIComponent(searchTerm)}&limit=5`)
          setSuggestions(res.data)
          setShowSuggestions(true)
        } catch (error) {
          console.error('Failed to fetch suggestions:', error)
          setSuggestions([])
        } finally {
          setIsSearching(false)
        }
      }, 500)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, hasResults, platformFilter, statusFilter])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddGameFromSuggestion = async (suggestion: any) => {
    if (!onAddGame) return

    // Call the parent's add game handler
    onAddGame(suggestion)
    setShowSuggestions(false)
    onSearchChange('')
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-4 items-center text-white p-4 bg-[#424652] rounded-lg">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white z-10" />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white animate-spin z-10" />
          )}
          <Input
            placeholder="Q Search games..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-[#424652] text-white placeholder:text-white/60 border-[#424652]"
          />
        </div>

        <Select value={platformFilter} onValueChange={onPlatformFilterChange}>
          <SelectTrigger className="w-44 text-white bg-[#424652] border-[#424652]">
            <SelectValue placeholder="All Platforms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="PC">PC</SelectItem>
            <SelectItem value="PlayStation">PlayStation</SelectItem>
            <SelectItem value="Xbox">Xbox</SelectItem>
            <SelectItem value="Nintendo Switch">Nintendo Switch</SelectItem>
            <SelectItem value="Multiple">Multiple</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-44 text-white bg-[#424652] border-[#424652]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Backlog">Backlog</SelectItem>
            <SelectItem value="Playing">Playing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Dropped">Dropped</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-44 text-white bg-[#424652] border-[#424652]">
            <SelectValue placeholder="Recently Added" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dateAdded">Recently Added</SelectItem>
            <SelectItem value="title">Title (A-Z)</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="hoursPlayed">Most Played</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-[#2a2d35] border border-gray-700 rounded-lg shadow-lg z-50 max-w-2xl"
        >
          <div className="p-3 border-b border-gray-700">
            <p className="text-sm text-gray-400">
              No games found in your collection. Here are some suggestions from IGDB:
            </p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="flex items-center gap-3 p-3 hover:bg-[#363943] transition-colors border-b border-gray-800 last:border-b-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-white">{suggestion.name}</p>
                  {suggestion.first_release_date && (
                    <p className="text-sm text-gray-400">
                      {new Date(suggestion.first_release_date * 1000).getFullYear()}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddGameFromSuggestion(suggestion)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add to Collection
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

