'use client'

import { useAuth } from '@/lib/auth'
import GameLibrary from './GameLibrary'
import Wishlist from './Wishlist'
import Friends from './Friends'
import Location from './Location'
import UpcomingReleases from './UpcomingReleases'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Game Shelf</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{user?.name}</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none">
                  {user?.picture ? (
                    <Avatar>
                      <AvatarImage src={user.picture} alt={user.name} />
                      <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <Avatar>
                      <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Navigation Tabs and Content */}
      <Tabs defaultValue="library" className="w-full">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0 border-b">
              <TabsTrigger 
                value="library" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                My Library
              </TabsTrigger>
              <TabsTrigger 
                value="wishlist" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Wishlist
              </TabsTrigger>
              <TabsTrigger 
                value="upcoming" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Upcoming Releases
              </TabsTrigger>
              <TabsTrigger 
                value="friends" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Friends
              </TabsTrigger>
              <TabsTrigger 
                value="location" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Location
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          <TabsContent value="library" className="mt-0">
            <GameLibrary />
          </TabsContent>
          <TabsContent value="wishlist" className="mt-0">
            <Wishlist />
          </TabsContent>
          <TabsContent value="upcoming" className="mt-0">
            <UpcomingReleases />
          </TabsContent>
          <TabsContent value="friends" className="mt-0">
            <Friends />
          </TabsContent>
          <TabsContent value="location" className="mt-0">
            <Location />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
