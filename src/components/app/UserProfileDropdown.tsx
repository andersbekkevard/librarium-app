"use client";

import { useAuthContext } from "@/lib/providers/AuthProvider";
import { useUserContext } from "@/lib/providers/UserProvider";
import {
  Activity,
  ChevronRight,
  Download,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Target,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const UserProfileDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, signOut } = useAuthContext();
  const { userProfile } = useUserContext();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    try {
      await signOut();
      setIsOpen(false);
      // Redirect to landing page after successful logout
      router.push("/");
    } catch {
      // Error is handled by the AuthProvider
      alert("An unexpected error occurred while signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleMenuItemClick = () => {
    setIsOpen(false);
    // TODO: Implement navigation to respective pages
  };

  const menuItems = [
    {
      id: "profile",
      label: "Profile Settings",
      icon: User,
      action: () => handleMenuItemClick(),
    },
    {
      id: "account",
      label: "Account Settings",
      icon: Settings,
      action: () => handleMenuItemClick(),
    },
    {
      id: "goals",
      label: "Reading Goals",
      icon: Target,
      action: () => handleMenuItemClick(),
    },
    {
      id: "privacy",
      label: "Privacy Settings",
      icon: Shield,
      action: () => handleMenuItemClick(),
    },
    {
      id: "activity",
      label: "Activity History",
      icon: Activity,
      action: () => handleMenuItemClick(),
    },
    {
      id: "export",
      label: "Export Data",
      icon: Download,
      action: () => handleMenuItemClick(),
    },
    {
      id: "help",
      label: "Help & Support",
      icon: HelpCircle,
      action: () => handleMenuItemClick(),
    },
  ];

  // Use UserProfile data with Firebase user as fallback
  const displayName =
    userProfile?.displayName || user?.displayName || "Anonymous User";
  const displayEmail = userProfile?.email || user?.email || "No email";
  const photoURL = userProfile?.photoURL || user?.photoURL;
  const memberSince = userProfile?.createdAt
    ? userProfile.createdAt.toDate().getFullYear().toString()
    : user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).getFullYear().toString()
    : "2024";

  // User statistics from profile
  const booksRead = userProfile?.totalBooksRead || 0;
  const currentlyReading = userProfile?.currentlyReading || 0;
  const booksInLibrary = userProfile?.booksInLibrary || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Profile Button */}
      <div className="flex items-center space-x-3 h-full">
        <div className="text-right flex flex-col justify-center h-full">
          <p className="text-sm font-medium text-foreground leading-tight">
            {displayName}
          </p>
          <p className="text-xs text-muted-foreground leading-tight">
            {user?.email ? user.email : `Reader since ${memberSince}`}
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          className="w-10 h-10 rounded-lg hover:bg-muted transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2"
          aria-label={`User menu for ${displayName}. ${
            isOpen ? "Close menu" : "Open menu"
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
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
                <div className="flex gap-2 mt-1 text-xs text-muted-foreground">
                  <span>{booksRead} read</span>
                  <span>•</span>
                  <span>{currentlyReading} reading</span>
                  <span>•</span>
                  <span>{booksInLibrary} total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
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
              );
            })}
          </div>

          {/* Separator */}
          <div className="h-px bg-border mx-2"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center space-x-3 px-4 py-2.5 text-left hover:bg-status-error/5 transition-colors duration-150 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-status-error border-t-transparent" />
                  <span className="text-sm font-medium text-status-error">
                    Signing Out...
                  </span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 text-status-error" />
                  <span className="text-sm font-medium text-status-error">
                    Sign Out
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;
