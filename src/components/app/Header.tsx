"use client";

import UserProfileDropdown from "@/components/app/UserProfileDropdown";
import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UI_CONFIG } from "@/lib/constants/constants";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { Bell, Book, Loader2 } from "lucide-react";
import SearchDropdown from "./SearchDropdown";

interface HeaderProps {
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  notificationCount = UI_CONFIG.DEFAULT_NOTIFICATION_COUNT,
}) => {
  const { loading } = useAuthContext();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border py-4 z-50">
      <div className="flex items-center h-10">
        {/* Logo Section - Fixed width to match sidebar exactly */}
        <div className="flex items-center space-x-2 h-full w-64 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Book className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Librarium</h1>
          </Link>
        </div>

        {/* Search Bar - Starts right after sidebar */}
        <div className="flex-1 max-w-2xl mr-8 h-full flex items-center justify-start">
          <SearchDropdown placeholder="Search books, authors, or genres..." />
        </div>

        {/* Right Side - Theme Toggle & User Profile */}
        <div className="flex items-center space-x-4 h-full ml-auto pr-6">
          {/* Theme Toggle */}
          <ToggleTheme />

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
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
  );
};

export default Header;
