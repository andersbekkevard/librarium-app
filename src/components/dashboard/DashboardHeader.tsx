interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title = "Dashboard",
  description = "Welcome back! Here's your reading overview.",
}) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-foreground mb-2">
        {title}
      </h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default DashboardHeader;