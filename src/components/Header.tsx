"use client"

import { useState } from "react"
import { Search, Sun, Moon, Bell, User, Book } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onSearch?: (query: string) => void
  userName?: string
  userSince?: string
  notificationCount?: number
}

export const Header: React.FC<HeaderProps> = ({
  onSearch,
  userName = "John Doe",
  userSince = "2023",
  notificationCount = 3
}) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark')
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
          <Button
            onClick={toggleTheme}
            variant="ghost"
            size="sm"
            className="w-9 h-9 p-0"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0"
            >
              <Bell className="h-4 w-4" />
            </Button>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-status-error text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-3 h-full">
            <div className="text-right flex flex-col justify-center h-full">
              <p className="text-sm font-medium text-foreground leading-tight">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground leading-tight">
                Reader since {userSince}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-10 h-10 p-0"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 