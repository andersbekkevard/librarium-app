import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { ProgressBar } from "../progress-bar";

describe("ProgressBar", () => {
  it("renders with correct width for given value", () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveStyle("width: 50%");
  });

  it("clamps value between 0 and 100", () => {
    let { container } = render(<ProgressBar value={150} />);
    let progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveStyle("width: 100%");

    container = render(<ProgressBar value={-10} />).container;
    progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveStyle("width: 0%");
  });

  it("applies custom className", () => {
    const { container } = render(
      <ProgressBar value={25} className="custom-class" />
    );
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("custom-class");
  });

  it("has correct default styling (sm variant)", () => {
    const { container } = render(<ProgressBar value={75} />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass(
      "w-full",
      "bg-muted",
      "rounded-full",
      "h-1.5"
    );

    const progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveClass(
      "bg-brand-primary",
      "h-1.5",
      "rounded-full",
      "transition-all",
      "duration-300"
    );
  });

  it("applies correct height for md variant", () => {
    const { container } = render(<ProgressBar value={50} variant="md" />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("h-2");

    const progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveClass("h-2");
  });

  it("applies correct height for lg variant", () => {
    const { container } = render(<ProgressBar value={50} variant="lg" />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("h-3");

    const progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveClass("h-3");
  });

  it("defaults to sm variant when no variant is provided", () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("h-1.5");

    const progressElement = container.querySelector(".bg-brand-primary");
    expect(progressElement).toHaveClass("h-1.5");
  });
});
