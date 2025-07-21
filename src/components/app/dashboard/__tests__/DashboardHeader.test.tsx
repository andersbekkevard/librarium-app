import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "../DashboardHeader";

import "@testing-library/jest-dom";

describe("DashboardHeader", () => {
  it("should render the default title and description when no props are provided", () => {
    render(<DashboardHeader />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Welcome back! Here's your reading overview.")).toBeInTheDocument();
  });

  it("should render the custom title and description when props are provided", () => {
    render(<DashboardHeader title="My Reading Stats" description="A summary of my progress." />);

    expect(screen.getByText("My Reading Stats")).toBeInTheDocument();
    expect(screen.getByText("A summary of my progress.")).toBeInTheDocument();
  });

  it("should render the title as a heading", () => {
    render(<DashboardHeader />);

    const heading = screen.getByRole("heading", { name: "Dashboard" });
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
  });
});