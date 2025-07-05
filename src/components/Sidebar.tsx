"use client"

import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Home, 
  BookOpen, 
  TrendingUp, 
  BarChart3, 
  Heart, 
  Users 
} from "lucide-react"

interface SidebarProps {
  activeItem?: string
  onItemClick?: (item: string) => void
}

const sidebarItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'library', label: 'My Library', icon: BookOpen },
  { id: 'progress', label: 'Reading Progress', icon: TrendingUp },
  { id: 'statistics', label: 'Statistics', icon: BarChart3 },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'shared', label: 'Shared Books', icon: Users },
]

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'dashboard', 
  onItemClick 
}) => {
  const handleItemClick = (itemId: string) => {
    onItemClick?.(itemId)
  }

  const handleAddBook = () => {
    console.log('Add book clicked')
    // Handle add book functionality
  }

  return (
    <div className="w-64 bg-background border-r border-border h-full flex flex-col">
      {/* Add Book Button */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={handleAddBook}
          className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black border-0"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-primary border-l-4 border-brand-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border">
        <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors">
          <div className="w-6 h-6 bg-muted-foreground rounded-full flex items-center justify-center mr-3">
            <span className="text-xs text-white font-medium">N</span>
          </div>
          Settings
        </button>
      </div>
    </div>
  )
}

export default Sidebar 