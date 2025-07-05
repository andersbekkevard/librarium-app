"use client"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/useAuth"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { 
  User, 
  Settings, 
  Target, 
  Shield, 
  Activity, 
  Download, 
  HelpCircle, 
  LogOut,
  ChevronRight 
} from "lucide-react"

interface UserProfileDropdownProps {
  userName?: string
  userSince?: string
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  userName = "John Doe",
  userSince = "2023"
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleMenuItemClick = (action: string) => {
    console.log('Menu item clicked:', action)
    setIsOpen(false)
    // TODO: Implement navigation to respective pages
  }

  const menuItems = [
    { 
      id: 'profile', 
      label: 'Profile Settings', 
      icon: User, 
      action: () => handleMenuItemClick('profile') 
    },
    { 
      id: 'account', 
      label: 'Account Settings', 
      icon: Settings, 
      action: () => handleMenuItemClick('account') 
    },
    { 
      id: 'goals', 
      label: 'Reading Goals', 
      icon: Target, 
      action: () => handleMenuItemClick('goals') 
    },
    { 
      id: 'privacy', 
      label: 'Privacy Settings', 
      icon: Shield, 
      action: () => handleMenuItemClick('privacy') 
    },
    { 
      id: 'activity', 
      label: 'Activity History', 
      icon: Activity, 
      action: () => handleMenuItemClick('activity') 
    },
    { 
      id: 'export', 
      label: 'Export Data', 
      icon: Download, 
      action: () => handleMenuItemClick('export') 
    },
    { 
      id: 'help', 
      label: 'Help & Support', 
      icon: HelpCircle, 
      action: () => handleMenuItemClick('help') 
    },
  ]

  // Use Firebase user data if available, otherwise fallback to props
  const displayName = user?.displayName || userName
  const displayEmail = user?.email || `Member since ${userSince}`
  const photoURL = user?.photoURL

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <div className="flex items-center space-x-3 h-full">
        <div className="text-right flex flex-col justify-center h-full">
          <p className="text-sm font-medium text-foreground leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {user?.email ? user.email : `Reader since ${userSince}`}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 rounded-lg hover:bg-muted transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label="User menu"
        >
          {photoURL ? (
            <img 
              src={photoURL} 
              alt="Profile" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border bg-muted/20">
            <div className="flex items-center space-x-3">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-brand-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50 transition-colors duration-150 group"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-sm font-medium text-foreground">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors opacity-0 group-hover:opacity-100" />
                </button>
              )
            })}
          </div>

          {/* Separator */}
          <div className="h-px bg-border mx-2"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-status-error/5 transition-colors duration-150 group"
            >
              <LogOut className="h-4 w-4 text-status-error" />
              <span className="text-sm font-medium text-status-error">
                Sign Out
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileDropdown 