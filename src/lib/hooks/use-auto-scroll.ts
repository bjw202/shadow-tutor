"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAutoScrollOptions {
  currentIndex: number;
  enabled: boolean;
  reEnableDelay?: number;
}

interface UseAutoScrollReturn {
  containerRef: React.RefObject<HTMLElement | null>;
  isAutoScrollEnabled: boolean;
  scrollToItem: (element: HTMLElement) => void;
  handleManualScroll: () => void;
}

const DEFAULT_RE_ENABLE_DELAY = 3000;

export function useAutoScroll({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  currentIndex,
  enabled,
  reEnableDelay = DEFAULT_RE_ENABLE_DELAY,
}: UseAutoScrollOptions): UseAutoScrollReturn {
  // Note: currentIndex is reserved for future use (e.g., scrolling to specific items)
  const containerRef = useRef<HTMLElement | null>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(enabled);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with enabled prop
  useEffect(() => {
    setIsAutoScrollEnabled(enabled);
  }, [enabled]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const scrollToItem = useCallback(
    (element: HTMLElement) => {
      if (!isAutoScrollEnabled || !enabled) return;

      element.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    },
    [isAutoScrollEnabled, enabled]
  );

  const handleManualScroll = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Disable auto-scroll
    setIsAutoScrollEnabled(false);

    // Re-enable after delay
    timeoutRef.current = setTimeout(() => {
      setIsAutoScrollEnabled(true);
    }, reEnableDelay);
  }, [reEnableDelay]);

  return {
    containerRef,
    isAutoScrollEnabled,
    scrollToItem,
    handleManualScroll,
  };
}
