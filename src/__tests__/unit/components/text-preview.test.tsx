import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TextPreview } from "@/components/upload/text-preview";
import type { TextSegment } from "@/types";

describe("TextPreview", () => {
  const mockSegments: TextSegment[] = [
    { id: "1", text: "First segment.", startPosition: 0, endPosition: 14 },
    { id: "2", text: "Second segment.", startPosition: 15, endPosition: 30 },
    { id: "3", text: "Third segment.", startPosition: 31, endPosition: 45 },
  ];

  describe("empty state", () => {
    it("should render empty state when no segments", () => {
      render(<TextPreview segments={[]} />);

      expect(screen.getByText(/no segments/i)).toBeInTheDocument();
    });

    it("should show helpful message in empty state", () => {
      render(<TextPreview segments={[]} />);

      expect(
        screen.getByText(/upload a file/i) || screen.getByText(/no segments/i)
      ).toBeInTheDocument();
    });
  });

  describe("displaying segments", () => {
    it("should display all segments", () => {
      render(<TextPreview segments={mockSegments} />);

      expect(screen.getByText("First segment.")).toBeInTheDocument();
      expect(screen.getByText("Second segment.")).toBeInTheDocument();
      expect(screen.getByText("Third segment.")).toBeInTheDocument();
    });

    it("should show segment numbers", () => {
      render(<TextPreview segments={mockSegments} />);

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("should render segments in a list", () => {
      render(<TextPreview segments={mockSegments} />);

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();

      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(3);
    });
  });

  describe("scrollable content", () => {
    it("should have scrollable container", () => {
      render(<TextPreview segments={mockSegments} />);

      const container = screen.getByTestId("segments-container");
      expect(container).toHaveClass("overflow-y-auto");
    });

    it("should handle many segments", () => {
      const manySegments: TextSegment[] = Array.from({ length: 50 }, (_, i) => ({
        id: String(i + 1),
        text: `Segment number ${i + 1}.`,
        startPosition: i * 20,
        endPosition: (i + 1) * 20 - 1,
      }));

      render(<TextPreview segments={manySegments} />);

      const items = screen.getAllByRole("listitem");
      expect(items).toHaveLength(50);
    });
  });

  describe("current segment highlighting", () => {
    it("should highlight current segment when provided", () => {
      render(<TextPreview segments={mockSegments} currentSegmentId="2" />);

      const items = screen.getAllByRole("listitem");
      // The second item should have highlighting class
      expect(items[1]).toHaveClass("bg-primary/10");
    });

    it("should not highlight when no current segment", () => {
      render(<TextPreview segments={mockSegments} />);

      const items = screen.getAllByRole("listitem");
      items.forEach((item) => {
        expect(item).not.toHaveClass("bg-primary/10");
      });
    });
  });
});
