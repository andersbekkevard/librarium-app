"use client";

import { ToggleTheme } from "@/components/toggle-theme";
import { Button } from "@/components/ui/button";
import { useCmdK } from "@/lib/hooks/useKeyboardShortcut";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { Book, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import SearchDropdown from "./SearchDropdown";
import UserProfileDropdown from "./UserProfileDropdown";

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { loading } = useAuthContext();
  const [searchOpen, setSearchOpen] = useState(false);

  // Handle Cmd+K keyboard shortcut
  useCmdK(() => {
    setSearchOpen(true);
  });

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border/60 py-4 z-70">
      <div className="flex items-center h-10">
        {/* Mobile Menu Button - Only visible on mobile/tablet */}
        <div className="lg:hidden flex items-center pl-4 pr-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onMenuClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Logo Section - Fixed width to match sidebar on desktop, responsive on mobile */}
        <div className="flex items-center gap-2.5 h-full px-2 lg:w-64 lg:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            <div className="w-9 h-9 bg-brand-accent/20 rounded-xl flex items-center justify-center shrink-0">
              <Book className="h-5 w-5 text-brand-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block tracking-tight">
              Librarium
            </h1>
          </Link>
        </div>

        {/* Search Bar - Responsive layout */}
        <div className="flex-1 max-w-2xl lg:max-w-none mr-4 lg:mr-8 h-full flex items-center justify-start">
          <SearchDropdown
            placeholder="Search books, authors, or genres..."
            isOpen={searchOpen}
            onOpenChange={setSearchOpen}
          />
        </div>

        {/* Right Side - Theme Toggle & User Profile */}
        <div className="flex items-center gap-2 lg:gap-3 h-full ml-auto pr-4 lg:pr-6">
          {/* Theme Toggle */}
          <ToggleTheme />

          {/* User Profile */}
          {loading ? (
            <div className="w-9 h-9 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-brand-accent" />
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
