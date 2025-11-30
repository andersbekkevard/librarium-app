import { FlameIcon } from "@phosphor-icons/react";

interface ReadingStreakCardProps {
  streakDays: number;
  encouragementText?: string;
}

export const ReadingStreakCard: React.FC<ReadingStreakCardProps> = ({
  streakDays,
  encouragementText = "Keep it up!",
}) => {
  return (
    <div className="bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/80">Reading Streak</p>
          <p className="text-3xl font-bold text-white tracking-tight">
            {streakDays} {streakDays === 1 ? "day" : "days"}
          </p>
          <p className="text-sm text-white/70 mt-1">{encouragementText}</p>
        </div>
        <div className="h-14 w-14 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-sm">
          <FlameIcon className="h-7 w-7 text-white" weight="fill" />
        </div>
      </div>
    </div>
  );
};

export default ReadingStreakCard;
