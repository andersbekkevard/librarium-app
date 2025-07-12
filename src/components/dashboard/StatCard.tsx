import { BRAND_COLORS } from "@/lib/design/colors";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = BRAND_COLORS.primary.text,
  iconBgColor = BRAND_COLORS.primary.bgLight,
}) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className={`h-8 w-8 ${iconBgColor} rounded-full flex items-center justify-center`}
        >
          <Icon
            className={`h-4 w-4 ${iconColor}`}
            data-testid="stat-card-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
