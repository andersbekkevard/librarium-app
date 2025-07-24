import { ActivityItem, Book, UserProfile } from "@/lib/models/models";
import { useMessageContext } from "@/lib/providers/MessageProvider";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import Image from "next/image";
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

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
          <div className="h-6 w-6 bg-muted-foreground/20 rounded"></div>
        </div>
        <div className="flex-1 bg-muted rounded-2xl p-4 relative">
          <div className="space-y-2">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
          </div>
          {/* Loading indicator with gentle pulse */}
          <div className="absolute -bottom-1 left-6 flex space-x-1">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg h-full flex flex-col">
      {/* Mobile: Collapsed header with expand button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors rounded-lg"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? "Collapse AI message" : "Expand AI message"}
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">
                AI Reading Companion
              </div>
              <div className="text-xs text-muted-foreground">
                {isLoading
                  ? "Generating message..."
                  : "Tap to view personalized message"}
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Mobile: Expandable content */}
        {isExpanded && (
          <div className="px-4 pb-4">
            {isLoading ? (
              <div className="bg-muted/50 rounded-lg p-4 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 bg-muted-foreground/20 rounded w-3/4"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
                  <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-brand-primary/5 to-brand-accent/5 border border-brand-primary/20 rounded-lg p-4">
                <div className="text-sm leading-relaxed text-foreground">
                  {currentMessage || "Loading your personalized message..."}
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="mt-2 text-xs text-status-warning">
                Using fallback message - AI service temporarily unavailable
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Original layout (hidden on mobile) */}
      <div className="hidden md:flex md:flex-col md:p-6 md:h-full">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex items-start space-x-4 flex-1">
            {/* AI Avatar */}
            <div className="h-12 w-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <Image
                src="/librarian.png"
                alt="Personal Librarian"
                width={40}
                height={40}
                className="h-10 w-10 object-contain rounded-full"
                priority
              />
            </div>

            {/* Chat bubble */}
            <div className="flex-1 bg-muted/50 rounded-2xl p-4 relative flex flex-col justify-between min-h-full">
              {/* Speech bubble tail */}
              <div className="absolute left-0 top-4 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-muted/50 -ml-3"></div>

              {/* Message content */}
              <div className="text-sm leading-relaxed text-foreground flex-1 flex items-center">
                {currentMessage || "Loading your personalized message..."}
              </div>

              {/* AI indicator */}
              <div className="flex items-center mt-3 pt-2 border-t border-border/50 flex-shrink-0">
                <Sparkles className="h-3 w-3 text-brand-primary mr-1" />
                <span className="text-xs text-muted-foreground font-medium">
                  AI Reading Companion
                </span>
              </div>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="mt-2 text-xs text-status-warning">
            Using fallback message - AI service temporarily unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedMessageSection;
