import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ImageCropper } from "../image-cropper";

// Mock canvas and blob functionality
const mockCanvas = {
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toBlob: jest.fn((callback) => {
    const mockBlob = new Blob(["mock-image-data"], { type: "image/jpeg" });
    callback(mockBlob);
  }),
  width: 100,
  height: 100,
};

// Mock document.createElement
const originalCreateElement = document.createElement;
beforeAll(() => {
  document.createElement = jest.fn((tagName) => {
    if (tagName === "canvas") {
      return mockCanvas as any;
    }
    return originalCreateElement.call(document, tagName);
  });
});

afterAll(() => {
  document.createElement = originalCreateElement;
});

describe("ImageCropper", () => {
  const mockImageUrl = "data:image/jpeg;base64,mock-image-data";
  const mockOnCrop = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the cropper with image", () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText("Crop Image")).toBeInTheDocument();
    expect(screen.getByAltText("Image to crop")).toBeInTheDocument();
    expect(
      screen.getByText("Drag to select the area you want to crop")
    ).toBeInTheDocument();
  });

  it("shows crop controls when crop area is selected", async () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByAltText("Image to crop");

    // Simulate image load
    fireEvent.load(image);

    // Simulate mouse down and move to create crop area
    fireEvent.mouseDown(image, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(image, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(image);

    await waitFor(() => {
      expect(screen.getByText("Reset")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
      expect(screen.getByText("Apply Crop")).toBeInTheDocument();
    });
  });

  it("calls onCancel when cancel button is clicked", async () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByAltText("Image to crop");

    // Simulate image load
    fireEvent.load(image);

    // Simulate crop selection to show the Cancel button
    fireEvent.mouseDown(image, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(image, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(image);

    await waitFor(() => {
      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);
    });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when X button is clicked", () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const xButton = screen.getByRole("button", { name: "" }); // X button has no text
    fireEvent.click(xButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("applies crop and calls onCrop when apply button is clicked", async () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByAltText("Image to crop");

    // Simulate image load
    fireEvent.load(image);

    // Simulate crop selection
    fireEvent.mouseDown(image, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(image, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(image);

    await waitFor(() => {
      const applyButton = screen.getByText("Apply Crop");
      fireEvent.click(applyButton);
    });

    expect(mockOnCrop).toHaveBeenCalledTimes(1);
    expect(mockOnCrop).toHaveBeenCalledWith(expect.any(Blob));
  });

  it("resets crop area when reset button is clicked", async () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByAltText("Image to crop");

    // Simulate image load
    fireEvent.load(image);

    // Simulate crop selection
    fireEvent.mouseDown(image, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(image, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(image);

    await waitFor(() => {
      const resetButton = screen.getByText("Reset");
      fireEvent.click(resetButton);
    });

    // Should show instructions again
    expect(
      screen.getByText("Drag to select the area you want to crop")
    ).toBeInTheDocument();
  });

  it("handles mouse leave during crop selection", async () => {
    render(
      <ImageCropper
        imageUrl={mockImageUrl}
        onCrop={mockOnCrop}
        onCancel={mockOnCancel}
      />
    );

    const image = screen.getByAltText("Image to crop");

    // Simulate image load
    fireEvent.load(image);

    // Start crop selection
    fireEvent.mouseDown(image, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(image, { clientX: 50, clientY: 50 });

    // Mouse leave should stop dragging
    fireEvent.mouseLeave(image);

    // Should still show crop area but not be dragging
    await waitFor(() => {
      expect(screen.getByText("Apply Crop")).toBeInTheDocument();
    });
  });
});
