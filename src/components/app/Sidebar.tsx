"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_COLORS } from "@/lib/design/colors";
import {
  Plus,
  Home,
  BookOpen,
  TrendingUp,
  BarChart3,
  Heart,
  Users,
} from "lucide-react";

interface SidebarProps {
  onAddBookClick?: () => void;
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "library", label: "My Library", icon: BookOpen, href: "/library" },
  { id: "progress", label: "Reading Progress", icon: TrendingUp, href: "/progress" },
  { id: "statistics", label: "Statistics", icon: BarChart3, href: "/statistics" },
  { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
  { id: "shared", label: "Shared Books", icon: Users, href: "/shared" },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onAddBookClick,
}) => {
  const pathname = usePathname();

  const handleAddBook = () => {
    onAddBookClick?.();
  };

  const isActiveItem = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="fixed left-0 top-[72px] w-64 h-[calc(100vh-72px)] bg-background border-r border-border flex flex-col z-40">
      {/* Add Book Button */}
      <div className="p-4 border-b border-border">
        <Button
          onClick={handleAddBook}
          className={`w-full ${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover} text-primary-foreground border-0`}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? `${BRAND_COLORS.primary.bgLight} ${BRAND_COLORS.primary.bgLightDark} ${BRAND_COLORS.primary.text} ${BRAND_COLORS.primary.border} border-l-4`
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border mt-auto">
        <Link
          href="/settings"
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-md transition-colors"
        >
          <div className="w-6 h-6 bg-muted-foreground rounded-full flex items-center justify-center mr-3">
            <span className="text-xs text-white font-medium">N</span>
          </div>
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
