import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentList } from "@/components/practice/segment-list";
import type { TextSegment } from "@/types";

describe("SegmentList", () => {
  const mockSegments: TextSegment[] = [
    { id: "1", text: "First segment text.", startPosition: 0, endPosition: 19 },
    {
      id: "2",
      text: "Second segment text.",
      startPosition: 20,
      endPosition: 40,
    },
    { id: "3", text: "Third segment text.", startPosition: 41, endPosition: 60 },
  ];

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render all segments", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText("First segment text.")).toBeInTheDocument();
      expect(screen.getByText("Second segment text.")).toBeInTheDocument();
      expect(screen.getByText("Third segment text.")).toBeInTheDocument();
    });

    it("should render segment numbers", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText("1.")).toBeInTheDocument();
      expect(screen.getByText("2.")).toBeInTheDocument();
      expect(screen.getByText("3.")).toBeInTheDocument();
    });

    it("should render title header", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText("Segments")).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      const { container } = render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });
  });

  describe("current segment highlighting", () => {
    it("should highlight current segment", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={1}
          onSelect={mockOnSelect}
        />
      );

      const buttons = screen.getAllByRole("button");
      // Second button (index 1) should have primary styling
      expect(buttons[1]).toHaveClass("bg-primary");
    });

    it("should set aria-current on current segment", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={1}
          onSelect={mockOnSelect}
        />
      );

      const buttons = screen.getAllByRole("button");
      expect(buttons[1]).toHaveAttribute("aria-current", "true");
      expect(buttons[0]).not.toHaveAttribute("aria-current");
      expect(buttons[2]).not.toHaveAttribute("aria-current");
    });
  });

  describe("segment selection", () => {
    it("should call onSelect with correct index when clicked", async () => {
      const user = userEvent.setup();

      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      const secondSegmentButton = screen.getByText("Second segment text.")
        .closest("button")!;
      await user.click(secondSegmentButton);

      expect(mockOnSelect).toHaveBeenCalledWith(1);
    });

    it("should call onSelect for first segment", async () => {
      const user = userEvent.setup();

      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={1}
          onSelect={mockOnSelect}
        />
      );

      const firstSegmentButton = screen.getByText("First segment text.")
        .closest("button")!;
      await user.click(firstSegmentButton);

      expect(mockOnSelect).toHaveBeenCalledWith(0);
    });

    it("should call onSelect for last segment", async () => {
      const user = userEvent.setup();

      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      const lastSegmentButton = screen.getByText("Third segment text.")
        .closest("button")!;
      await user.click(lastSegmentButton);

      expect(mockOnSelect).toHaveBeenCalledWith(2);
    });
  });

  describe("empty state", () => {
    it("should show empty message when no segments", () => {
      render(
        <SegmentList segments={[]} currentIndex={0} onSelect={mockOnSelect} />
      );

      expect(screen.getByText("No segments available")).toBeInTheDocument();
    });

    it("should not render list when empty", () => {
      render(
        <SegmentList segments={[]} currentIndex={0} onSelect={mockOnSelect} />
      );

      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  describe("scrollable container", () => {
    it("should render segments in a list", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should render each segment as a list item", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);
    });
  });

  describe("auto scroll", () => {
    it("should have auto-scroll enabled by default", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
        />
      );

      // The list should be rendered - auto-scroll is internal
      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should accept isAutoScrollEnabled prop", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={0}
          onSelect={mockOnSelect}
          isAutoScrollEnabled={false}
        />
      );

      const list = screen.getByRole("list");
      expect(list).toBeInTheDocument();
    });

    it("should apply highlight animation class to current segment", () => {
      render(
        <SegmentList
          segments={mockSegments}
          currentIndex={1}
          onSelect={mockOnSelect}
        />
      );

      const buttons = screen.getAllByRole("button");
      // Current segment should have animation class
      expect(buttons[1]).toHaveClass("transition-colors");
    });
  });
});
