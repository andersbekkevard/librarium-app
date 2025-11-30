"use client";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Home,
  Plus,
  Settings,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  onAddBookClick?: () => void;
  onNavigate?: () => void;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  disabled?: boolean;
}

const sidebarItems: SidebarItem[] = [
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
    disabled: true,
  },
  {
    id: "shared",
    label: "Shared Books",
    icon: Users,
    href: "/shared",
    disabled: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  onAddBookClick,
  onNavigate,
}) => {
  const pathname = usePathname();

  const handleAddBook = () => {
    onAddBookClick?.();
    onNavigate?.();
  };

  const isActiveItem = (href: string) => {
    return pathname === href;
  };

  return (
    <div className="w-64 h-full bg-background border-r border-border/60 flex flex-col">
      {/* Add Book Button */}
      <div className="p-4 border-b border-border/60">
        <Button
          onClick={handleAddBook}
          variant="eden"
          className="w-full"
          size="default"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveItem(item.href);
            const isBeforeProgress = item.id === "progress";

            return (
              <div key={item.id}>
                {isBeforeProgress && (
                  <li aria-hidden="true" className="my-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border/60" />
                      <span className="text-xs text-muted-foreground select-none uppercase tracking-wider font-medium">
                        Coming Soon
                      </span>
                      <div className="flex-1 h-px bg-border/60" />
                    </div>
                  </li>
                )}
                <li>
                  <Link
                    href={item.disabled ? "#" : item.href}
                    onClick={
                      item.disabled ? (e) => e.preventDefault() : onNavigate
                    }
                    aria-disabled={item.disabled}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                      ${
                        isActive
                          ? "bg-brand-primary/10 text-brand-primary border-l-4 border-brand-primary -ml-0.5 pl-[10px]"
                          : item.disabled
                          ? "text-muted-foreground/60 cursor-not-allowed"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-brand-accent" : ""
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              </div>
            );
          })}
        </ul>
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-border/60 mt-auto">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent rounded-xl transition-all duration-200"
        >
          <div className="w-7 h-7 bg-brand-secondary rounded-lg flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          Settings
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
