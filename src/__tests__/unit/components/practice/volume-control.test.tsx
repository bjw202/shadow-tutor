import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VolumeControl } from "@/components/practice/volume-control";

describe("VolumeControl", () => {
  const defaultProps = {
    volume: 0.7,
    isMuted: false,
    onVolumeChange: vi.fn(),
    onMuteToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the volume control component", () => {
      render(<VolumeControl {...defaultProps} />);

      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should render volume icon button", () => {
      render(<VolumeControl {...defaultProps} />);

      expect(screen.getByRole("button", { name: /volume/i })).toBeInTheDocument();
    });
  });

  describe("volume icons", () => {
    it("should show Volume2 icon when volume is above 50%", () => {
      render(<VolumeControl {...defaultProps} volume={0.7} />);

      const button = screen.getByRole("button", { name: /volume/i });
      expect(button.querySelector("[data-testid='volume-high']")).toBeInTheDocument();
    });

    it("should show Volume1 icon when volume is between 1% and 50%", () => {
      render(<VolumeControl {...defaultProps} volume={0.3} />);

      const button = screen.getByRole("button", { name: /volume/i });
      expect(button.querySelector("[data-testid='volume-low']")).toBeInTheDocument();
    });

    it("should show VolumeX icon when volume is 0", () => {
      render(<VolumeControl {...defaultProps} volume={0} />);

      const button = screen.getByRole("button", { name: /volume/i });
      expect(button.querySelector("[data-testid='volume-muted']")).toBeInTheDocument();
    });

    it("should show VolumeX icon when muted", () => {
      render(<VolumeControl {...defaultProps} volume={0.7} isMuted={true} />);

      const button = screen.getByRole("button", { name: /volume/i });
      expect(button.querySelector("[data-testid='volume-muted']")).toBeInTheDocument();
    });
  });

  describe("slider behavior", () => {
    it("should have correct slider value based on volume", () => {
      render(<VolumeControl {...defaultProps} volume={0.7} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "70");
    });

    it("should have min 0 and max 100 values", () => {
      render(<VolumeControl {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "0");
      expect(slider).toHaveAttribute("aria-valuemax", "100");
    });

    it("should call onVolumeChange when slider value changes", () => {
      const onVolumeChange = vi.fn();
      render(<VolumeControl {...defaultProps} onVolumeChange={onVolumeChange} />);

      const slider = screen.getByRole("slider");
      fireEvent.keyDown(slider, { key: "ArrowRight" });

      expect(onVolumeChange).toHaveBeenCalled();
    });
  });

  describe("mute toggle", () => {
    it("should call onMuteToggle when icon button is clicked", async () => {
      const user = userEvent.setup();
      const onMuteToggle = vi.fn();
      render(<VolumeControl {...defaultProps} onMuteToggle={onMuteToggle} />);

      const button = screen.getByRole("button", { name: /volume/i });
      await user.click(button);

      expect(onMuteToggle).toHaveBeenCalled();
    });
  });

  describe("responsive behavior", () => {
    it("should have hidden class for mobile by default", () => {
      const { container } = render(<VolumeControl {...defaultProps} />);

      // The component should have responsive hiding class
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("hidden", "md:flex");
    });

    it("should accept className prop for custom styling", () => {
      const { container } = render(
        <VolumeControl {...defaultProps} className="custom-class" />
      );

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("accessibility", () => {
    it("should have accessible slider label", () => {
      render(<VolumeControl {...defaultProps} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow");
    });

    it("should have accessible button label", () => {
      render(<VolumeControl {...defaultProps} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAccessibleName(/volume/i);
    });
  });

  describe("edge cases", () => {
    it("should handle volume at exact boundaries", () => {
      const { rerender } = render(<VolumeControl {...defaultProps} volume={0} />);
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "0");

      rerender(<VolumeControl {...defaultProps} volume={1} />);
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "100");
    });

    it("should handle volume at 50% boundary", () => {
      render(<VolumeControl {...defaultProps} volume={0.5} />);

      const button = screen.getByRole("button", { name: /volume/i });
      // At exactly 50%, should show Volume1
      expect(button.querySelector("[data-testid='volume-low']")).toBeInTheDocument();
    });
  });
});
