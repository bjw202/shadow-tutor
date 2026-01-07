import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShadowingSettings } from "@/components/practice/shadowing-settings";
import type { ShadowingSettings as ShadowingSettingsType } from "@/types/practice";

describe("ShadowingSettings", () => {
  const defaultSettings: ShadowingSettingsType = {
    pauseDuration: 5,
    repeatCount: 1,
    autoAdvance: true,
  };
  const mockOnSettingsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render settings panel", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByTestId("shadowing-settings")).toBeInTheDocument();
    });

    it("should display pause duration slider", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText(/pause duration/i)).toBeInTheDocument();
      // Radix UI Slider uses role="slider" on the thumb element
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("should display current pause duration value", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, pauseDuration: 10 }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText("10s")).toBeInTheDocument();
    });

    it("should display repeat count control", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText(/repeat count/i)).toBeInTheDocument();
    });

    it("should display current repeat count value", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, repeatCount: 3 }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText("3x")).toBeInTheDocument();
    });

    it("should display auto-advance toggle", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByText(/auto-advance/i)).toBeInTheDocument();
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          className="custom-class"
        />
      );

      expect(screen.getByTestId("shadowing-settings")).toHaveClass("custom-class");
    });
  });

  describe("pause duration slider", () => {
    it("should have min value of 1", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      // Radix UI Slider thumb has the aria attributes
      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "1");
    });

    it("should have max value of 30", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "30");
    });

    it("should call onSettingsChange when pause duration changes", async () => {
      const user = userEvent.setup();
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const slider = screen.getByRole("slider");

      // Simulate keyboard interaction to change value
      slider.focus();
      await user.keyboard("{ArrowRight}");

      expect(mockOnSettingsChange).toHaveBeenCalledWith({ pauseDuration: 6 });
    });
  });

  describe("repeat count control", () => {
    it("should display increment and decrement buttons", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      expect(screen.getByRole("button", { name: /decrease repeat/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /increase repeat/i })).toBeInTheDocument();
    });

    it("should call onSettingsChange when increment button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const incrementButton = screen.getByRole("button", { name: /increase repeat/i });
      await user.click(incrementButton);

      expect(mockOnSettingsChange).toHaveBeenCalledWith({ repeatCount: 2 });
    });

    it("should call onSettingsChange when decrement button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, repeatCount: 3 }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const decrementButton = screen.getByRole("button", { name: /decrease repeat/i });
      await user.click(decrementButton);

      expect(mockOnSettingsChange).toHaveBeenCalledWith({ repeatCount: 2 });
    });

    it("should disable decrement button when repeatCount is 1", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, repeatCount: 1 }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const decrementButton = screen.getByRole("button", { name: /decrease repeat/i });
      expect(decrementButton).toBeDisabled();
    });

    it("should disable increment button when repeatCount is 10", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, repeatCount: 10 }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const incrementButton = screen.getByRole("button", { name: /increase repeat/i });
      expect(incrementButton).toBeDisabled();
    });
  });

  describe("auto-advance toggle", () => {
    it("should be checked when autoAdvance is true", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, autoAdvance: true }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("should not be checked when autoAdvance is false", () => {
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, autoAdvance: false }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const toggle = screen.getByRole("switch");
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it("should call onSettingsChange when toggled", async () => {
      const user = userEvent.setup();
      render(
        <ShadowingSettings
          settings={{ ...defaultSettings, autoAdvance: true }}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      const toggle = screen.getByRole("switch");
      await user.click(toggle);

      expect(mockOnSettingsChange).toHaveBeenCalledWith({ autoAdvance: false });
    });
  });

  describe("disabled state", () => {
    it("should disable all controls when disabled prop is true", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
          disabled
        />
      );

      const slider = screen.getByRole("slider");
      const incrementButton = screen.getByRole("button", { name: /increase repeat/i });
      const decrementButton = screen.getByRole("button", { name: /decrease repeat/i });
      const toggle = screen.getByRole("switch");

      // Radix slider thumb shows disabled state via data-disabled attribute
      expect(slider.closest("[data-disabled]")).toBeInTheDocument();
      expect(incrementButton).toBeDisabled();
      expect(decrementButton).toBeDisabled();
      expect(toggle).toBeDisabled();
    });
  });

  describe("accessibility", () => {
    it("should have proper labels for all controls", () => {
      render(
        <ShadowingSettings
          settings={defaultSettings}
          onSettingsChange={mockOnSettingsChange}
        />
      );

      // Check slider exists
      expect(screen.getByRole("slider")).toBeInTheDocument();
      // Check switch with auto-advance label
      expect(screen.getByRole("switch")).toBeInTheDocument();
      expect(screen.getByText(/auto-advance/i)).toBeInTheDocument();
    });
  });
});
