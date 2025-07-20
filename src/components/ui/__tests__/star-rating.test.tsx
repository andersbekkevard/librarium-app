import { render, screen } from "@testing-library/react";
import { StarRating } from "../star-rating";

describe("StarRating", () => {
  it("renders the correct number of stars", () => {
    render(<StarRating rating={3} />);
    
    const stars = screen.getAllByTestId("star-icon");
    expect(stars).toHaveLength(5);
  });

  it("displays rating text when showText is true", () => {
    render(<StarRating rating={4} showText={true} />);
    
    expect(screen.getByText("(4/5)")).toBeInTheDocument();
  });

  it("hides rating text when showText is false", () => {
    render(<StarRating rating={4} showText={false} />);
    
    expect(screen.queryByText("(4/5)")).not.toBeInTheDocument();
  });

  it("handles edge case ratings", () => {
    const { rerender } = render(<StarRating rating={0} showText={true} />);
    expect(screen.getByText("(0/5)")).toBeInTheDocument();

    rerender(<StarRating rating={5} showText={true} />);
    expect(screen.getByText("(5/5)")).toBeInTheDocument();
  });

  it("handles non-integer ratings", () => {
    render(<StarRating rating={3.5} showText={true} />);
    expect(screen.getByText("(3.5/5)")).toBeInTheDocument();
  });
})