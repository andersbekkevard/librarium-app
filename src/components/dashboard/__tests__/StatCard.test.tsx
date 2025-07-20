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

  it("should handle zero values", () => {
    render(<StatCard title="Zero Value" value={0} icon={Book} />);

    expect(screen.getByText("Zero Value")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("should handle empty string values", () => {
    render(<StatCard title="Empty String" value="" icon={Book} />);

    expect(screen.getByText("Empty String")).toBeInTheDocument();
    // Test functionality: component should render without crashing with empty value
    const statCard = screen.getByText("Empty String").closest('div');
    expect(statCard).toBeInTheDocument();
  });
})