import { useEffect } from "react";
import { Bot, Sparkles } from "lucide-react";
import { useMessageContext } from "@/lib/providers/MessageProvider";
import { Book, UserProfile, ActivityItem } from "@/lib/models/models";

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

export const PersonalizedMessageSection: React.FC<PersonalizedMessageSectionProps> = ({
  userProfile,
  books,
  stats,
  recentActivity,
}) => {
  const {
    currentMessage,
    isLoading,
    error,
    generateMessage,
    clearError,
  } = useMessageContext();

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
  }, [userProfile?.id, books, stats, recentActivity, generateMessage, clearError]);

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
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="flex items-start space-x-4 flex-1">
          {/* AI Avatar */}
          <div className="h-12 w-12 bg-gradient-to-br from-brand-primary to-brand-accent rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="h-6 w-6 text-white" />
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
  );
};

export default PersonalizedMessageSection;