import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ProgressBar } from "../progress-bar";

describe("ProgressBar", () => {
  it("renders with correct width for given value", () => {
    const { container } = render(<ProgressBar value={50} />);
    const progressElement = container.querySelector('.bg-brand-primary');
    expect(progressElement).toHaveStyle("width: 50%");
  });

  it("clamps value between 0 and 100", () => {
    let { container } = render(<ProgressBar value={150} />);
    let progressElement = container.querySelector('.bg-brand-primary');
    expect(progressElement).toHaveStyle("width: 100%");

    container = render(<ProgressBar value={-10} />).container;
    progressElement = container.querySelector('.bg-brand-primary');
    expect(progressElement).toHaveStyle("width: 0%");
  });

  it("applies custom className", () => {
    const { container } = render(<ProgressBar value={25} className="custom-class" />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("custom-class");
  });

  it("has correct default styling", () => {
    const { container } = render(<ProgressBar value={75} />);
    const progressBarContainer = container.firstChild;
    expect(progressBarContainer).toHaveClass("w-full", "bg-muted", "rounded-full", "h-1.5");
    
    const progressElement = container.querySelector('.bg-brand-primary');
    expect(progressElement).toHaveClass("bg-brand-primary", "h-1.5", "rounded-full", "transition-all", "duration-300");
  });
});