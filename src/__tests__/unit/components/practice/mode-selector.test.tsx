import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModeSelector } from "@/components/practice/mode-selector";

describe("ModeSelector", () => {
  const mockOnModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render mode selector with both options", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.getByRole("button", { name: /continuous/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /shadowing/i })).toBeInTheDocument();
    });

    it("should highlight continuous mode when selected", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      const continuousButton = screen.getByRole("button", { name: /continuous/i });
      expect(continuousButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should highlight shadowing mode when selected", () => {
      render(
        <ModeSelector
          mode="shadowing"
          onModeChange={mockOnModeChange}
        />
      );

      const shadowingButton = screen.getByRole("button", { name: /shadowing/i });
      expect(shadowingButton).toHaveAttribute("aria-pressed", "true");
    });

    it("should accept className prop", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
          className="custom-class"
        />
      );

      const container = screen.getByRole("group");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("interactions", () => {
    it("should call onModeChange with 'shadowing' when shadowing button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      const shadowingButton = screen.getByRole("button", { name: /shadowing/i });
      await user.click(shadowingButton);

      expect(mockOnModeChange).toHaveBeenCalledWith("shadowing");
    });

    it("should call onModeChange with 'continuous' when continuous button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ModeSelector
          mode="shadowing"
          onModeChange={mockOnModeChange}
        />
      );

      const continuousButton = screen.getByRole("button", { name: /continuous/i });
      await user.click(continuousButton);

      expect(mockOnModeChange).toHaveBeenCalledWith("continuous");
    });

    it("should not call onModeChange when clicking already selected mode", async () => {
      const user = userEvent.setup();
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      const continuousButton = screen.getByRole("button", { name: /continuous/i });
      await user.click(continuousButton);

      expect(mockOnModeChange).not.toHaveBeenCalled();
    });
  });

  describe("disabled state", () => {
    it("should disable both buttons when disabled prop is true", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
          disabled
        />
      );

      const continuousButton = screen.getByRole("button", { name: /continuous/i });
      const shadowingButton = screen.getByRole("button", { name: /shadowing/i });

      expect(continuousButton).toBeDisabled();
      expect(shadowingButton).toBeDisabled();
    });

    it("should not call onModeChange when disabled", async () => {
      const user = userEvent.setup();
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
          disabled
        />
      );

      const shadowingButton = screen.getByRole("button", { name: /shadowing/i });
      await user.click(shadowingButton);

      expect(mockOnModeChange).not.toHaveBeenCalled();
    });
  });

  describe("accessibility", () => {
    it("should have proper role for button group", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should have aria-label for accessibility", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "Playback mode");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      const continuousButton = screen.getByRole("button", { name: /continuous/i });
      continuousButton.focus();

      await user.keyboard("{Tab}");

      const shadowingButton = screen.getByRole("button", { name: /shadowing/i });
      expect(shadowingButton).toHaveFocus();
    });
  });

  describe("icons", () => {
    it("should display appropriate icons for each mode", () => {
      render(
        <ModeSelector
          mode="continuous"
          onModeChange={mockOnModeChange}
        />
      );

      // Icons should be rendered (we check for SVG elements)
      const buttons = screen.getAllByRole("button");
      buttons.forEach(button => {
        const svg = button.querySelector("svg");
        expect(svg).toBeInTheDocument();
      });
    });
  });
});
