import { Icon as PhosphorIcon } from "@phosphor-icons/react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: PhosphorIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-brand-primary",
  iconBgColor = "bg-brand-accent/15",
}) => {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-6 hover:shadow-sm hover:border-brand-accent/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div
          className={`h-10 w-10 ${iconBgColor} rounded-xl flex items-center justify-center`}
        >
          <Icon
            className={`h-5 w-5 ${iconColor}`}
            weight="light"
            data-testid="stat-card-icon"
          />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
