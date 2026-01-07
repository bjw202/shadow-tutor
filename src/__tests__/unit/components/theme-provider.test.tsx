import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import { ThemeProvider } from "@/components/theme-provider";
import { useAppStore } from "@/stores/app-store";

// Store the original matchMedia
const originalMatchMedia = window.matchMedia;

describe("ThemeProvider", () => {
  beforeEach(() => {
    // Reset the store before each test
    useAppStore.setState({ theme: "system" });

    // Clean up any existing classes on documentElement
    document.documentElement.classList.remove("light", "dark");

    // Mock matchMedia to return light mode by default
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: dark)" ? false : true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    // Restore original matchMedia
    window.matchMedia = originalMatchMedia;
    document.documentElement.classList.remove("light", "dark");
  });

  describe("initial rendering", () => {
    it("should render children", () => {
      const { getByText } = render(
        <ThemeProvider>
          <div>Test Child</div>
        </ThemeProvider>
      );

      expect(getByText("Test Child")).toBeInTheDocument();
    });

    it("should apply system theme on mount (light mode)", () => {
      // Mock system preference as light
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false, // prefers-color-scheme: dark is false = light mode
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass("light");
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("should apply system theme on mount (dark mode)", () => {
      // Mock system preference as dark
      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)", // dark mode
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement).not.toHaveClass("light");
    });
  });

  describe("theme changes", () => {
    it("should apply light class when theme is light", () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      act(() => {
        useAppStore.setState({ theme: "light" });
      });

      expect(document.documentElement).toHaveClass("light");
      expect(document.documentElement).not.toHaveClass("dark");
    });

    it("should apply dark class when theme is dark", () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      act(() => {
        useAppStore.setState({ theme: "dark" });
      });

      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement).not.toHaveClass("light");
    });

    it("should remove previous theme class when switching themes", () => {
      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      // Switch to light
      act(() => {
        useAppStore.setState({ theme: "light" });
      });
      expect(document.documentElement).toHaveClass("light");

      // Switch to dark
      act(() => {
        useAppStore.setState({ theme: "dark" });
      });
      expect(document.documentElement).toHaveClass("dark");
      expect(document.documentElement).not.toHaveClass("light");

      // Switch back to light
      act(() => {
        useAppStore.setState({ theme: "light" });
      });
      expect(document.documentElement).toHaveClass("light");
      expect(document.documentElement).not.toHaveClass("dark");
    });
  });

  describe("system theme", () => {
    it("should listen to system theme changes when theme is system", () => {
      const addEventListenerMock = vi.fn();
      const removeEventListenerMock = vi.fn();

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: addEventListenerMock,
        removeEventListener: removeEventListenerMock,
      }));

      const { unmount } = render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      // Should have added event listener for system theme
      expect(addEventListenerMock).toHaveBeenCalledWith(
        "change",
        expect.any(Function)
      );

      // Cleanup on unmount
      unmount();
      expect(removeEventListenerMock).toHaveBeenCalled();
    });

    it("should not listen to system changes when theme is explicit", () => {
      const addEventListenerMock = vi.fn();

      window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        addEventListener: addEventListenerMock,
        removeEventListener: vi.fn(),
      }));

      // Set explicit theme before rendering
      useAppStore.setState({ theme: "dark" });

      render(
        <ThemeProvider>
          <div>Test</div>
        </ThemeProvider>
      );

      // Should not listen when theme is explicitly set
      expect(addEventListenerMock).not.toHaveBeenCalled();
    });
  });
});
