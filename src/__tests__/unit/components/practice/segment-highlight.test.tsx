import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SegmentHighlight } from "@/components/practice/segment-highlight";

describe("SegmentHighlight", () => {
  describe("rendering", () => {
    it("should render the segment text", () => {
      render(<SegmentHighlight text="Hello, world!" segmentId="seg-1" />);

      expect(screen.getByText("Hello, world!")).toBeInTheDocument();
    });

    it("should render with highlight styling", () => {
      const { container } = render(
        <SegmentHighlight text="Test segment" segmentId="seg-1" />
      );

      expect(container.firstChild).toHaveClass("segment-highlight");
    });

    it("should display placeholder when text is empty", () => {
      render(<SegmentHighlight text="" segmentId="seg-1" />);

      expect(screen.getByText(/no segment selected/i)).toBeInTheDocument();
    });

    it("should display placeholder when text is whitespace only", () => {
      render(<SegmentHighlight text="   " segmentId="seg-1" />);

      expect(screen.getByText(/no segment selected/i)).toBeInTheDocument();
    });
  });

  describe("animation on segment change", () => {
    it("should have fade animation class", () => {
      const { container } = render(
        <SegmentHighlight text="Segment text" segmentId="seg-1" />
      );

      const highlightElement = container.querySelector(".segment-highlight");
      expect(highlightElement).toHaveClass("animate-fade-in");
    });

    it("should use segmentId as key for re-render on change", () => {
      const { rerender, container } = render(
        <SegmentHighlight text="First segment" segmentId="seg-1" />
      );

      const firstElement = container.querySelector(".segment-highlight");
      expect(firstElement).toBeInTheDocument();

      rerender(<SegmentHighlight text="Second segment" segmentId="seg-2" />);

      expect(screen.getByText("Second segment")).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have aria-live for screen reader announcements", () => {
      const { container } = render(
        <SegmentHighlight text="Current segment" segmentId="seg-1" />
      );

      const highlightElement = container.querySelector(".segment-highlight");
      expect(highlightElement).toHaveAttribute("aria-live", "polite");
    });

    it("should have aria-atomic for complete announcement", () => {
      const { container } = render(
        <SegmentHighlight text="Current segment" segmentId="seg-1" />
      );

      const highlightElement = container.querySelector(".segment-highlight");
      expect(highlightElement).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("styling", () => {
    it("should accept className prop", () => {
      const { container } = render(
        <SegmentHighlight
          text="Test segment"
          segmentId="seg-1"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should have proper text styling for readability", () => {
      const { container } = render(
        <SegmentHighlight text="Test segment" segmentId="seg-1" />
      );

      const highlightElement = container.querySelector(".segment-highlight");
      expect(highlightElement).toHaveClass("text-lg");
    });
  });
});
