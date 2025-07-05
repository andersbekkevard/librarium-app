"use client"

import { useState } from "react"
import { Search, Sun, Moon, Bell, User } from "lucide-react"
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
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search books, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500"
            />
          </form>
        </div>

        {/* Right Side - Theme Toggle & User Profile */}
        <div className="flex items-center space-x-4">
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
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reader since {userSince}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-9 h-9 p-0"
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