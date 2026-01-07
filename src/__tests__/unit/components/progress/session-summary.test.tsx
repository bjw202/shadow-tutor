import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionSummary } from "@/components/progress/session-summary";

describe("SessionSummary", () => {
  const mockOnClose = vi.fn();
  const mockOnRestart = vi.fn();

  const defaultProps = {
    isOpen: true,
    sessionTitle: "Test Session",
    totalSegments: 10,
    completedSegments: 10,
    totalStudyTime: 3600, // 1 hour in seconds
    onClose: mockOnClose,
    onRestart: mockOnRestart,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render when isOpen is true", () => {
      render(<SessionSummary {...defaultProps} />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<SessionSummary {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should display completion message", () => {
      render(<SessionSummary {...defaultProps} />);

      expect(screen.getByText("Session Complete!")).toBeInTheDocument();
    });

    it("should display session title", () => {
      render(<SessionSummary {...defaultProps} />);

      expect(screen.getByText(/Test Session/)).toBeInTheDocument();
    });
  });

  describe("statistics", () => {
    it("should display completion rate as 100%", () => {
      render(<SessionSummary {...defaultProps} />);

      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it("should display total segments", () => {
      render(<SessionSummary {...defaultProps} />);

      // There are two "10" values: completedSegments and totalSegments
      const allTens = screen.getAllByText("10");
      expect(allTens.length).toBeGreaterThanOrEqual(2);
    });

    it("should display formatted study time", () => {
      render(<SessionSummary {...defaultProps} />);

      // 3600 seconds = 1 hour or 60 minutes
      expect(screen.getByText(/1.*hour|60.*min/i)).toBeInTheDocument();
    });

    it("should handle short study time", () => {
      render(<SessionSummary {...defaultProps} totalStudyTime={45} />);

      // 45 seconds
      expect(screen.getByText(/45.*sec|0:45/i)).toBeInTheDocument();
    });

    it("should handle partial completion", () => {
      render(
        <SessionSummary
          {...defaultProps}
          completedSegments={7}
        />
      );

      expect(screen.getByText(/70%/)).toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("should call onClose when close button clicked", () => {
      render(<SessionSummary {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /close|done|finish/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("should call onRestart when restart button clicked", () => {
      render(<SessionSummary {...defaultProps} />);

      const restartButton = screen.getByRole("button", { name: /restart|again|practice/i });
      fireEvent.click(restartButton);

      expect(mockOnRestart).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("should have accessible dialog", () => {
      render(<SessionSummary {...defaultProps} />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
