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

      expect(screen.getByRole("button", { name: "0.5x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "0.75x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1x" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "1.25x" })).toBeInTheDocument();
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

    it("should call onChange with 0.75 when 0.75x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "0.75x" }));

      expect(mockOnChange).toHaveBeenCalledWith(0.75);
    });

    it("should call onChange with 1.0 when 1x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={0.5} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.0);
    });

    it("should call onChange with 1.25 when 1.25x button clicked", async () => {
      const user = userEvent.setup();

      render(<PlaybackSpeed value={1.0} onChange={mockOnChange} />);

      await user.click(screen.getByRole("button", { name: "1.25x" }));

      expect(mockOnChange).toHaveBeenCalledWith(1.25);
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
      render(<PlaybackSpeed value={1.25} onChange={mockOnChange} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "1.25");
    });
  });
});
