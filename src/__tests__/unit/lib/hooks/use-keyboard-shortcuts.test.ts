import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

describe("useKeyboardShortcuts", () => {
  const defaultHandlers = {
    onSeekForward: vi.fn(),
    onSeekBackward: vi.fn(),
    onTogglePlayPause: vi.fn(),
    onVolumeUp: vi.fn(),
    onVolumeDown: vi.fn(),
    onToggleMute: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("seek shortcuts", () => {
    it("should call onSeekForward when ArrowRight is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onSeekForward).toHaveBeenCalledWith(5);
    });

    it("should call onSeekBackward when ArrowLeft is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onSeekBackward).toHaveBeenCalledWith(5);
    });

    it("should seek 10 seconds with Shift+Arrow", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", {
          key: "ArrowRight",
          shiftKey: true,
        });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onSeekForward).toHaveBeenCalledWith(10);
    });
  });

  describe("playback shortcuts", () => {
    it("should call onTogglePlayPause when Space is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: " " });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).toHaveBeenCalled();
    });

    it("should call onTogglePlayPause when K is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "k" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).toHaveBeenCalled();
    });
  });

  describe("volume shortcuts", () => {
    it("should call onVolumeUp when ArrowUp is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onVolumeUp).toHaveBeenCalled();
    });

    it("should call onVolumeDown when ArrowDown is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onVolumeDown).toHaveBeenCalled();
    });

    it("should call onToggleMute when M is pressed", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      act(() => {
        const event = new KeyboardEvent("keydown", { key: "m" });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onToggleMute).toHaveBeenCalled();
    });
  });

  describe("enabled state", () => {
    it("should not respond when disabled", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultHandlers, enabled: false })
      );

      act(() => {
        const event = new KeyboardEvent("keydown", { key: " " });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).not.toHaveBeenCalled();
    });

    it("should respond when enabled", () => {
      renderHook(() =>
        useKeyboardShortcuts({ ...defaultHandlers, enabled: true })
      );

      act(() => {
        const event = new KeyboardEvent("keydown", { key: " " });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).toHaveBeenCalled();
    });
  });

  describe("input focus handling", () => {
    it("should not trigger shortcuts when input is focused", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      // Create an input and focus it
      const input = document.createElement("input");
      document.body.appendChild(input);
      input.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", { key: " " });
        Object.defineProperty(event, "target", { value: input });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it("should not trigger shortcuts when textarea is focused", () => {
      renderHook(() => useKeyboardShortcuts(defaultHandlers));

      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.focus();

      act(() => {
        const event = new KeyboardEvent("keydown", { key: " " });
        Object.defineProperty(event, "target", { value: textarea });
        window.dispatchEvent(event);
      });

      expect(defaultHandlers.onTogglePlayPause).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });
  });

  describe("cleanup", () => {
    it("should remove event listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() =>
        useKeyboardShortcuts(defaultHandlers)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "keydown",
        expect.any(Function)
      );
    });
  });
});
