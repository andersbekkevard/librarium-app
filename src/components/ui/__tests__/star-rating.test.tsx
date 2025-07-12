import { render, screen } from "@testing-library/react";
import { StarRating } from "../star-rating";

describe("StarRating", () => {
  it("renders the correct number of filled stars", () => {
    render(<StarRating rating={3} />);
    
    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(5);
    
    // Check that 3 stars are filled and 2 are empty
    const filledStars = stars.slice(0, 3);
    const emptyStars = stars.slice(3);
    
    filledStars.forEach(star => {
      expect(star).toHaveClass("fill-status-warning", "text-status-warning");
    });
    
    emptyStars.forEach(star => {
      expect(star).toHaveClass("fill-muted", "text-muted-foreground");
    });
  });

  it("displays rating text when showText is true", () => {
    render(<StarRating rating={4} showText={true} />);
    
    expect(screen.getByText("(4/5)")).toBeInTheDocument();
  });

  it("hides rating text when showText is false", () => {
    render(<StarRating rating={4} showText={false} />);
    
    expect(screen.queryByText("(4/5)")).not.toBeInTheDocument();
  });

  it("applies correct size classes", () => {
    const { rerender } = render(<StarRating rating={3} size="sm" />);
    
    let stars = screen.getAllByTestId("star-icon");
    stars.forEach(star => {
      expect(star).toHaveClass("h-3", "w-3");
    });

    rerender(<StarRating rating={3} size="md" />);
    stars = screen.getAllByTestId("star-icon");
    stars.forEach(star => {
      expect(star).toHaveClass("h-4", "w-4");
    });

    rerender(<StarRating rating={3} size="lg" />);
    stars = screen.getAllByTestId("star-icon");
    stars.forEach(star => {
      expect(star).toHaveClass("h-5", "w-5");
    });
  });

  it("supports custom maxRating", () => {
    render(<StarRating rating={3} maxRating={10} />);
    
    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(10);
    
    expect(screen.getByText("(3/10)")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<StarRating rating={3} className="custom-class" />);
    
    const container = screen.getByTestId("star-rating-container");
    expect(container).toHaveClass("custom-class");
  });

  it("handles zero rating", () => {
    render(<StarRating rating={0} />);
    
    const stars = screen.getAllByTestId("star-icon");
    stars.forEach(star => {
      expect(star).toHaveClass("fill-muted", "text-muted-foreground");
    });
    
    expect(screen.getByText("(0/5)")).toBeInTheDocument();
  });

  it("handles maximum rating", () => {
    render(<StarRating rating={5} />);
    
    const stars = screen.getAllByTestId("star-icon");
    stars.forEach(star => {
      expect(star).toHaveClass("fill-status-warning", "text-status-warning");
    });
    
    expect(screen.getByText("(5/5)")).toBeInTheDocument();
  });
});