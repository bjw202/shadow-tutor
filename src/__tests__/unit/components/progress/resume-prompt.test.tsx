import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResumePrompt } from "@/components/progress/resume-prompt";

describe("ResumePrompt", () => {
  const mockOnResume = vi.fn();
  const mockOnStartNew = vi.fn();

  const defaultProps = {
    sessionTitle: "Test Session",
    completionRate: 0.5,
    lastSegmentIndex: 5,
    totalSegments: 10,
    onResume: mockOnResume,
    onStartNew: mockOnStartNew,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render when isOpen is true", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("should not render when isOpen is false", () => {
      render(<ResumePrompt {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("should display session title", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByText(/Test Session/)).toBeInTheDocument();
    });

    it("should display completion rate percentage", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });

    it("should display progress info", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByText(/5/)).toBeInTheDocument();
      expect(screen.getByText(/10/)).toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("should call onResume when resume button clicked", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      const resumeButton = screen.getByRole("button", { name: /resume|continue/i });
      fireEvent.click(resumeButton);

      expect(mockOnResume).toHaveBeenCalledTimes(1);
    });

    it("should call onStartNew when start new button clicked", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      const startNewButton = screen.getByRole("button", { name: /new|start over/i });
      fireEvent.click(startNewButton);

      expect(mockOnStartNew).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("should have accessible dialog title", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("alertdialog")).toHaveAccessibleName();
    });

    it("should have accessible description", () => {
      render(<ResumePrompt {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("alertdialog")).toHaveAccessibleDescription();
    });
  });

  describe("different states", () => {
    it("should handle 0% completion", () => {
      render(
        <ResumePrompt
          {...defaultProps}
          isOpen={true}
          completionRate={0}
          lastSegmentIndex={0}
        />
      );

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it("should handle nearly complete session", () => {
      render(
        <ResumePrompt
          {...defaultProps}
          isOpen={true}
          completionRate={0.9}
          lastSegmentIndex={9}
        />
      );

      expect(screen.getByText(/90%/)).toBeInTheDocument();
    });
  });
});
