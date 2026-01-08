import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaybackSpeed } from "@/components/practice/playback-speed";

describe("PlaybackSpeed", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should display current speed value", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      expect(screen.getByText(/Speed: 1\.00x/)).toBeInTheDocument();
    });

    it("should render slider", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should render speed preset buttons", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      // SPEC-PLAYBACK-001-FIX: Updated preset values
      expect(screen.getByRole("button", { name: "0.5x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.8x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.2x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.5x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2x" })).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      const { container } = render(
        <PlaybackSpeed
          value={1.0}
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });

    it("should display formatted speed with two decimal places", () => {
      render(<PlaybackSpeed value={1.25} onChange={mockOnChange} />);

      expect(screen.getByText(/Speed: 1\.25x/)).toBeInTheDocument();
    });
  });

  describe("preset buttons", () => {
    it("should call onChange with 0.5 when 0.5x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "0.5x" }));

      expect(mockOnChange).toHaveBeenCalledWith(0.5);
    });

    // SPEC-PLAYBACK-001-FIX: Updated 0.75 -> 0.8
    it("should call onChange with 0.8 when 0.8x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "0.8x" }));

      expect(mockOnChange).toHaveBeenCalledWith(0.8);
    });

    it("should call onChange with 1.0 when 1x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={0.5} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.0);
    });

    // SPEC-PLAYBACK-001-FIX: Updated 1.25 -> 1.2
    it("should call onChange with 1.2 when 1.2x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1.2x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.2);
    });

    it("should call onChange with 1.5 when 1.5x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1.5x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.5);
    });

    it("should call onChange with 2.0 when 2x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "2x" }));

      expect(mockOnChange).toHaveBeenCalledWith(2.0);
    });
  });

  describe("active preset highlighting", () => {
    it("should highlight active preset button", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      const activeButton = screen.getByRole("button", { name: "1x" });
      // Default variant button should have bg-primary class
      expect(activeButton).toHaveClass("bg-primary");
    });

    it("should not highlight inactive preset buttons", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      const inactiveButton = screen.getByRole("button", { name: "0.5x" });
      // Outline variant button should not have bg-primary class
      expect(inactiveButton).not.toHaveClass("bg-primary");
    });

    it("should update highlight when value changes", () => {
      const { rerender } = render(
        <PlaybackSpeed value={1.0} onChange={mockOnChange} />
      );

      expect(screen.getByRole("button", { name: "1x" })).toHaveClass(
        "bg-primary"
      );

      rerender(<PlaybackSpeed value={1.5} onChange={mockOnChange} />);

      expect(screen.getByRole("button", { name: "1.5x" })).toHaveClass(
        "bg-primary"
      );
      expect(screen.getByRole("button", { name: "1x" })).not.toHaveClass(
        "bg-primary"
      );
    });
  });

  describe("slider", () => {
    it("should render slider element", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should have min value of 0.5", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "0.5");
    });

    it("should have max value of 2", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "2");
    });

    it("should reflect current value", () => {
      render(<PlaybackSpeed value={1.2} onChange={mockOnChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "1.2");
    });
  });

  // SPEC-PLAYBACK-001-FIX: Updated preset values
  describe("SPEC-PLAYBACK-001-FIX: new preset values", () => {
    it("should render new preset buttons [0.5, 0.8, 1.0, 1.2, 1.5, 2.0]", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      // New presets should exist
      expect(screen.getByRole("button", { name: "0.5x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.8x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.2x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.5x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "2x" })).toBeInTheDocument();
    });

    it("should NOT render old preset 0.75x button", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      // Old 0.75x preset should NOT exist
      expect(screen.queryByRole("button", { name: "0.75x" })).not.toBeInTheDocument();
    });

    it("should NOT render old preset 1.25x button", () => {
      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      // Old 1.25x preset should NOT exist
      expect(screen.queryByRole("button", { name: "1.25x" })).not.toBeInTheDocument();
    });

    it("should call onChange with 0.8 when 0.8x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "0.8x" }));

      expect(mockOnChange).toHaveBeenCalledWith(0.8);
    });

    it("should call onChange with 1.2 when 1.2x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1.2x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.2);
    });

    it("should highlight 0.8x button when value is 0.8", () => {
      render(<PlaybackSpeed value={0.8} onChange={mockOnChange} />);

      const button = screen.getByRole("button", { name: "0.8x" });
      expect(button).toHaveClass("bg-primary");
    });

    it("should highlight 1.2x button when value is 1.2", () => {
      render(<PlaybackSpeed value={1.2} onChange={mockOnChange} />);

      const button = screen.getByRole("button", { name: "1.2x" });
      expect(button).toHaveClass("bg-primary");
    });
  });
});
