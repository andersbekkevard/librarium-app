import { BRAND_COLORS } from "@/lib/design/colors";
import { render, screen } from "@testing-library/react";
import { Book, TrendingUp, Zap } from "lucide-react";
import { StatCard } from "../StatCard";

import "@testing-library/jest-dom";

describe("StatCard", () => {
  it("should render the title and value correctly", () => {
    render(<StatCard title="Total Books" value={125} icon={Book} />);

    expect(screen.getByText("Total Books")).toBeInTheDocument();
    expect(screen.getByText("125")).toBeInTheDocument();
  });

  it("should format numerical values with toLocaleString", () => {
    render(<StatCard title="Large Number" value={10000} icon={TrendingUp} />);

    expect(screen.getByText("10,000")).toBeInTheDocument();
  });

  it("should render string values as is", () => {
    render(<StatCard title="Streak" value="25 days" icon={Zap} />);

    expect(screen.getByText("25 days")).toBeInTheDocument();
  });

  it("should render the icon", () => {
    render(<StatCard title="Total Books" value={125} icon={Book} />);

    const icon = screen.getByTestId("stat-card-icon");
    expect(icon).toBeInTheDocument();
  });

  it("should apply default icon colors", () => {
    render(<StatCard title="Total Books" value={125} icon={Book} />);

    const icon = screen.getByTestId("stat-card-icon");
    expect(icon).toHaveClass(BRAND_COLORS.primary.text);
    const iconContainer = icon.parentElement;
    expect(iconContainer).toHaveClass(BRAND_COLORS.primary.bgLight);
  });

  it("should apply custom icon colors when provided", () => {
    render(
      <StatCard
        title="Custom Colors"
        value="Test"
        icon={Zap}
        iconColor="text-red-500"
        iconBgColor="bg-red-100"
      />
    );

    const icon = screen.getByTestId("stat-card-icon");
    expect(icon).toHaveClass("text-red-500");
    const iconContainer = icon.parentElement;
    expect(iconContainer).toHaveClass("bg-red-100");
  });
});
