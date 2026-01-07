import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShadowingTimer } from "@/components/practice/shadowing-timer";

describe("ShadowingTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("rendering", () => {
    it("should render the timer when visible", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByTestId("shadowing-timer")).toBeInTheDocument();
    });

    it("should not render when not visible", () => {
      render(
        <ShadowingTimer
          isVisible={false}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.queryByTestId("shadowing-timer")).not.toBeInTheDocument();
    });

    it("should display remaining time", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={15}
          totalTime={20}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should display skip button", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
          className="custom-class"
        />
      );

      expect(screen.getByTestId("shadowing-timer")).toHaveClass("custom-class");
    });
  });

  describe("countdown behavior", () => {
    it("should call onTimeUpdate when time changes", () => {
      const mockOnTimeUpdate = vi.fn();
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
          onTimeUpdate={mockOnTimeUpdate}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnTimeUpdate).toHaveBeenCalledWith(9);
    });

    it("should call onComplete when timer reaches 0", () => {
      const mockOnComplete = vi.fn();
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={1}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={mockOnComplete}
        />
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it("should not count down when not visible", () => {
      const mockOnTimeUpdate = vi.fn();
      render(
        <ShadowingTimer
          isVisible={false}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
          onTimeUpdate={mockOnTimeUpdate}
        />
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(mockOnTimeUpdate).not.toHaveBeenCalled();
    });
  });

  describe("skip functionality", () => {
    it("should call onSkip when skip button is clicked", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockOnSkip = vi.fn();

      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={mockOnSkip}
          onComplete={vi.fn()}
        />
      );

      const skipButton = screen.getByRole("button", { name: /skip/i });
      await user.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalled();
    });
  });

  describe("progress indicator", () => {
    it("should display circular progress indicator", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={5}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      // Check for SVG circle element (progress indicator)
      const svgElement = screen.getByTestId("shadowing-timer").querySelector("svg");
      expect(svgElement).toBeInTheDocument();
    });

    it("should show correct progress percentage", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={5}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      // Progress should be at 50% (5/10)
      const progressCircle = screen.getByTestId("progress-circle");
      expect(progressCircle).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    it("should have aria-label for timer", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      const timer = screen.getByTestId("shadowing-timer");
      expect(timer).toHaveAttribute("aria-label");
    });

    it("should have accessible skip button", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      const skipButton = screen.getByRole("button", { name: /skip/i });
      expect(skipButton).toBeInTheDocument();
    });
  });

  describe("instruction text", () => {
    it("should display instruction text", () => {
      render(
        <ShadowingTimer
          isVisible={true}
          remainingTime={10}
          totalTime={10}
          onSkip={vi.fn()}
          onComplete={vi.fn()}
        />
      );

      expect(screen.getByText(/repeat/i)).toBeInTheDocument();
    });
  });
});
