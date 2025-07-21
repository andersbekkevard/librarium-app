"use client";

import { Button } from "@/components/ui/button";
import { BRAND_COLORS } from "@/lib/design/colors";
import { BarChart3, BookOpen, Home, Plus, Target, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onAddBookClick?: () => void;
  onNavigate?: () => void;
  customColors?: {
    active: string;
    hover: string;
    text: string;
    border: string;
  };
}

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "library", label: "My Library", icon: BookOpen, href: "/library" },
  {
    id: "statistics",
    label: "Statistics",
    icon: BarChart3,
    href: "/statistics",
  },
  {
    id: "progress",
    label: "Reading Goals",
    icon: Target,
    href: "/progress",
    customColors: {
      inactive: "text-muted-foreground",
      active: `${BRAND_COLORS.primary.bgLight} ${BRAND_COLORS.primary.bgLightDark} ${BRAND_COLORS.primary.text} ${BRAND_COLORS.primary.border} border-l-4`,
    },
  },
  {
    id: "shared",
    label: "Shared Books",
    icon: Users,
    href: "/shared",
    customColors: {
      inactive: "text-muted-foreground",
      active: `${BRAND_COLORS.primary.bgLight} ${BRAND_COLORS.primary.bgLightDark} ${BRAND_COLORS.primary.text} ${BRAND_COLORS.primary.border} border-l-4`,
    },
  },
  //   { id: "wishlist", label: "Wishlist", icon: Heart, href: "/wishlist" },
];

export const Sidebar: React.FC<SidebarProps> = ({ onAddBookClick, onNavigate }) => {
  const pathname = usePathname();

  const handleAddBook = () => {
    onAddBookClick?.();
    onNavigate?.();
  };

  const isActiveItem = (href: string) => {
    return pathname === href;
  };

  const getItemColors = (item: any, isActive: boolean) => {
    if (isActive) {
      return (
        item.customColors?.active ||
        `${BRAND_COLORS.primary.bgLight} ${BRAND_COLORS.primary.bgLightDark} ${BRAND_COLORS.primary.text} ${BRAND_COLORS.primary.border} border-l-4`
      );
    }
    return item.customColors?.inactive || "text-foreground hover:bg-muted";
  };

  return (
    <div className="w-64 h-full bg-background border-r border-border flex flex-col">
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
          {sidebarItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);

            // Insert separator and label before 'progress' (Reading Goals)
            const isBeforeProgress = item.id === "progress";

            return (
              <div key={item.id}>
                {isBeforeProgress && (
                  <li
                    aria-hidden="true"
                    className="my-2"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground select-none uppercase tracking-wider">
                        Coming Soon
                      </span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  </li>
                )}
                <li>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${getItemColors(
                      item,
                      isActive
                    )}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Link>
                </li>
              </div>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-border mt-auto">
        <Link
          href="/settings"
          onClick={onNavigate}
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
