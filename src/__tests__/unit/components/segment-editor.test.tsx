import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SegmentEditor } from "@/components/upload/segment-editor";

describe("SegmentEditor", () => {
  const mockOnParseModeChange = vi.fn();
  const mockOnReparse = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("parse mode selector", () => {
    it("should render parse mode selector", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should display current parse mode", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByRole("combobox")).toHaveTextContent(/sentence/i);
    });

    it("should call onParseModeChange when mode is changed", async () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      // Click to open select
      const select = screen.getByRole("combobox");
      fireEvent.click(select);

      // Click on phrase option
      const phraseOption = await screen.findByRole("option", { name: /phrase/i });
      fireEvent.click(phraseOption);

      expect(mockOnParseModeChange).toHaveBeenCalledWith("phrase");
    });
  });

  describe("segment count display", () => {
    it("should show segment count", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/segment/i)).toBeInTheDocument();
    });

    it("should show correct pluralization for 1 segment", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={1}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/1 segment(?!s)/i)).toBeInTheDocument();
    });

    it("should show correct pluralization for multiple segments", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={10}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(screen.getByText(/10 segments/i)).toBeInTheDocument();
    });
  });

  describe("reparse button", () => {
    it("should render reparse button", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByRole("button", { name: /reparse|re-parse/i })
      ).toBeInTheDocument();
    });

    it("should call onReparse when clicked", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      const button = screen.getByRole("button", { name: /reparse|re-parse/i });
      fireEvent.click(button);

      expect(mockOnReparse).toHaveBeenCalledTimes(1);
    });
  });

  describe("confirm button", () => {
    it("should render confirm button", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      expect(
        screen.getByRole("button", { name: /confirm|save|continue/i })
      ).toBeInTheDocument();
    });

    it("should call onConfirm when clicked", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      const button = screen.getByRole("button", { name: /confirm|save|continue/i });
      fireEvent.click(button);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });

    it("should disable confirm button when no segments", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={0}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
        />
      );

      const button = screen.getByRole("button", { name: /confirm|save|continue/i });
      expect(button).toBeDisabled();
    });
  });

  describe("disabled state", () => {
    it("should disable all controls when disabled prop is true", () => {
      render(
        <SegmentEditor
          parseMode="sentence"
          segmentCount={5}
          onParseModeChange={mockOnParseModeChange}
          onReparse={mockOnReparse}
          onConfirm={mockOnConfirm}
          disabled={true}
        />
      );

      expect(screen.getByRole("combobox")).toBeDisabled();
      expect(screen.getByRole("button", { name: /reparse|re-parse/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /confirm|save|continue/i })).toBeDisabled();
    });
  });
});
