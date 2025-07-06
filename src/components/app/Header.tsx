"use client"

import { useState } from "react"
import { Search, Bell, Book, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ToggleTheme } from "@/components/toggle-theme"
import UserProfileDropdown from "@/components/app/UserProfileDropdown"
import { useAuthContext } from "@/components/auth/AuthProvider"

interface HeaderProps {
  onSearch?: (query: string) => void
  notificationCount?: number
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  notificationCount = 3
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, loading } = useAuthContext()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border px-6 py-4 z-50">
      <div className="flex items-center justify-between h-10">
        {/* Logo Section */}
        <div className="flex items-center space-x-2 h-full">
          <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
            <Book className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Librarium
          </h1>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8 h-full flex items-center">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search books, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-foreground placeholder-muted-foreground"
            />
          </form>
        </div>

        {/* Right Side - Theme Toggle & User Profile */}
        <div className="flex items-center space-x-4 h-full">
          {/* Theme Toggle */}
          <ToggleTheme />

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0"
            >
              <Bell className="size-5" />
            </Button>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>

          {/* User Profile */}
          {loading ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <UserProfileDropdown />
          )}
        </div>
      </div>
    </header>
  )
}

export default Header 