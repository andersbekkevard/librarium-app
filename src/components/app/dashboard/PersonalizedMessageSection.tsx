"use client";

import { ActivityItem, Book, UserProfile } from "@/lib/models/models";
import { useMessageContext } from "@/lib/providers/MessageProvider";
import { CaretDownIcon, CaretUpIcon, SparkleIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

interface Stats {
  totalBooks: number;
  finishedBooks: number;
  totalPagesRead: number;
  currentlyReading: number;
  readingStreak: number;
}

interface PersonalizedMessageSectionProps {
  userProfile: UserProfile;
  books: Book[];
  stats: Stats;
  recentActivity: ActivityItem[];
}

export const PersonalizedMessageSection: React.FC<
  PersonalizedMessageSectionProps
> = ({ userProfile, books, stats, recentActivity }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentMessage, isLoading, error, generateMessage, clearError } =
    useMessageContext();

  useEffect(() => {
    const loadMessage = async () => {
      try {
        clearError();
        await generateMessage({
          userProfile,
          books,
          stats,
          recentActivity,
        });
      } catch (err) {
        console.error("Failed to generate personalized message:", err);
      }
    };

    if (userProfile?.id) {
      loadMessage();
    }
  }, [
    userProfile?.id,
    books,
    stats,
    recentActivity,
    generateMessage,
    clearError,
  ]);

  // Loading skeleton with green shimmer
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      <div className="h-4 bg-brand-primary/10 rounded-full w-full animate-pulse" />
      <div className="h-4 bg-brand-primary/8 rounded-full w-5/6 animate-pulse delay-75" />
      <div className="h-4 bg-brand-primary/6 rounded-full w-4/6 animate-pulse delay-150" />
    </div>
  );

  return (
    <div className="relative group">
      {/* Main card container */}
      <div className="relative overflow-hidden rounded-xl border border-brand-primary/25 bg-gradient-to-br from-brand-primary/[0.03] via-card to-brand-accent/[0.05] shadow-[0_6px_20px_-6px_rgba(36,70,51,0.25)]">
        {/* Decorative corner glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-primary/[0.08] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-accent/[0.06] rounded-full blur-2xl pointer-events-none" />

        {/* Mobile: Collapsed view */}
        <div className="md:hidden relative">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-brand-primary/[0.03] transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Collapse insight" : "Expand insight"}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center h-9 w-9 rounded-lg bg-gradient-to-br from-brand-primary/15 to-brand-accent/10 border border-brand-primary/20">
                <SparkleIcon
                  className="h-4 w-4 text-brand-primary"
                  weight="duotone"
                />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-foreground">
                  Your Reading Companion
                </span>
                <p className="text-xs text-brand-primary/70">
                  {isLoading ? "Thinking..." : "Tap to read insight"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-brand-primary/10">
              {isExpanded ? (
                <CaretUpIcon
                  className="h-3.5 w-3.5 text-brand-primary"
                  weight="bold"
                />
              ) : (
                <CaretDownIcon
                  className="h-3.5 w-3.5 text-brand-primary"
                  weight="bold"
                />
              )}
            </div>
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 pt-1">
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <p className="text-sm leading-relaxed text-foreground/90">
                  {currentMessage || "Loading your personalized insight..."}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Desktop: Full view */}
        <div className="hidden md:block relative p-6">
          <div className="flex gap-5">
            {/* AI Avatar/Icon */}
            <div className="flex-shrink-0">
              <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary shadow-md">
                <SparkleIcon className="h-5 w-5 text-white" weight="fill" />
                {/* Pulse ring on loading */}
                {isLoading && (
                  <div className="absolute inset-0 rounded-xl border-2 border-brand-primary/50 animate-ping" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg font-heading font-medium text-brand-primary">
                  Librarium AI
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-primary/10 text-brand-primary border border-brand-primary/20">
                  Reading Companion
                </span>
              </div>

              {/* Message */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <blockquote className="text-[15px] leading-relaxed text-foreground/90">
                  {currentMessage || "Loading your personalized insight..."}
                </blockquote>
              )}

              {error && !isLoading && (
                <p className="mt-3 text-xs text-status-warning flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-status-warning" />
                  Using cached insight — AI service temporarily unavailable
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedMessageSection;
