interface ReadingStreakCardProps {
  streakDays: number;
  encouragementText?: string;
}

export const ReadingStreakCard: React.FC<ReadingStreakCardProps> = ({
  streakDays,
  encouragementText = "Keep it up!",
}) => {
  return (
    <div className="bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">
            Reading Streak
          </p>
          <p className="text-2xl font-bold text-white">{streakDays} days</p>
          <p className="text-sm text-white/60 mt-1">{encouragementText}</p>
        </div>
        <div className="h-12 w-12 bg-white/10 rounded-full flex items-center justify-center">
          <div className="h-6 w-6 bg-white/20 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingStreakCard;