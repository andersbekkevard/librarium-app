"use client";

import UserProfileDropdown from "@/components/app/UserProfileDropdown";
import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { UI_CONFIG } from "@/lib/constants/constants";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { Book, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import SearchDropdown from "./SearchDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  sidebarOpen = false, // TODO: Can be used for menu icon state indication
}) => {
  const { loading } = useAuthContext();

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border py-4 z-70">
      <div className="flex items-center h-10">
        {/* Mobile Menu Button - Only visible on mobile/tablet */}
        <div className="lg:hidden flex items-center pl-4 pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="p-2 h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo Section - Fixed width to match sidebar on desktop, responsive on mobile */}
        <div className="flex items-center space-x-2 h-full px-2 lg:w-64 lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Book className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground hidden lg:block">
              Librarium
            </h1>
          </Link>
        </div>

        {/* Search Bar - Responsive layout */}
        <div className="flex-1 max-w-2xl lg:max-w-none mr-4 lg:mr-8 h-full flex items-center justify-start">
          <SearchDropdown placeholder="Search books, authors, or genres..." />
        </div>

        {/* Right Side - Theme Toggle & User Profile */}
        <div className="flex items-center space-x-1 lg:space-x-4 h-full ml-auto pr-4 lg:pr-6">
          {/* Theme Toggle */}
          <ToggleTheme />

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
