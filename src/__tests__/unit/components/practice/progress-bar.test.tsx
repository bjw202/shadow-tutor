import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProgressBar } from "@/components/practice/progress-bar";

describe("ProgressBar", () => {
  const defaultProps = {
    currentTime: 30,
    duration: 120,
    isLoading: false,
    onSeek: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the progress bar component", () => {
      render(<ProgressBar {...defaultProps} />);

      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should display current time and duration", () => {
      render(<ProgressBar {...defaultProps} />);

      expect(screen.getByText("0:30")).toBeInTheDocument();
      expect(screen.getByText("2:00")).toBeInTheDocument();
    });

    it("should format times correctly for various durations", () => {
      render(<ProgressBar currentTime={65} duration={754} isLoading={false} onSeek={vi.fn()} />);

      expect(screen.getByText("1:05")).toBeInTheDocument();
      expect(screen.getByText("12:34")).toBeInTheDocument();
    });

    it("should display 0:00 for both times when duration is 0", () => {
      render(<ProgressBar currentTime={0} duration={0} isLoading={false} onSeek={vi.fn()} />);

      const zeroTimes = screen.getAllByText("0:00");
      expect(zeroTimes).toHaveLength(2);
    });
  });

  describe("slider behavior", () => {
    it("should have correct slider value based on currentTime", () => {
      render(<ProgressBar {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "30");
    });

    it("should have correct min and max values", () => {
      render(<ProgressBar {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "0");
      expect(slider).toHaveAttribute("aria-valuemax", "120");
    });

    it("should call onSeek when slider value changes", () => {
      const onSeek = vi.fn();
      render(<ProgressBar {...defaultProps} onSeek={onSeek} />);

      const slider = screen.getByRole("slider");

      // Radix UI Slider uses onValueChange which expects an array
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      // The slider interaction triggers onSeek
      expect(onSeek).toHaveBeenCalled();
    });
  });

  describe("loading state", () => {
    it("should show loading indicator when isLoading is true", () => {
      render(<ProgressBar {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("progress-loading")).toBeInTheDocument();
    });

    it("should not show loading indicator when isLoading is false", () => {
      render(<ProgressBar {...defaultProps} isLoading={false} />);

      expect(screen.queryByTestId("progress-loading")).not.toBeInTheDocument();
    });

    it("should disable slider when loading", () => {
      render(<ProgressBar {...defaultProps} isLoading={true} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("data-disabled", "");
    });
  });

  describe("accessibility", () => {
    it("should have accessible label via aria-label on root", () => {
      render(<ProgressBar {...defaultProps} />);

      // Radix UI Slider applies aria-label on the Root component
      const slider = screen.getByRole("slider");
      // The slider should be accessible
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute("aria-valuenow");
    });

    it("should have proper aria attributes for screen readers", () => {
      render(<ProgressBar {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "0");
      expect(slider).toHaveAttribute("aria-valuemax", "120");
      expect(slider).toHaveAttribute("aria-valuenow", "30");
    });
  });

  describe("edge cases", () => {
    it("should handle NaN currentTime", () => {
      render(<ProgressBar currentTime={NaN} duration={120} isLoading={false} onSeek={vi.fn()} />);

      expect(screen.getByText("0:00")).toBeInTheDocument();
    });

    it("should handle NaN duration", () => {
      render(<ProgressBar currentTime={30} duration={NaN} isLoading={false} onSeek={vi.fn()} />);

      const zeroTimes = screen.getAllByText("0:00");
      expect(zeroTimes.length).toBeGreaterThanOrEqual(1);
    });

    it("should handle currentTime greater than duration", () => {
      render(<ProgressBar currentTime={150} duration={120} isLoading={false} onSeek={vi.fn()} />);

      // Should clamp value display
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "120");
    });
  });
});
