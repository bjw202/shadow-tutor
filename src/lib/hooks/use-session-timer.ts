import { useState, useCallback, useEffect, useRef } from "react";
import { formatTime } from "@/lib/utils/format-time";

interface UseSessionTimerOptions {
  /** Auto-start timer on mount */
  autoStart?: boolean;
  /** Callback when timer updates (every second) */
  onTick?: (elapsedSeconds: number) => void;
}

interface UseSessionTimerReturn {
  /** Elapsed time in seconds */
  elapsedSeconds: number;
  /** Whether the timer is running */
  isRunning: boolean;
  /** Formatted time string (M:SS) */
  formattedTime: string;
  /** Start the timer */
  start: () => void;
  /** Stop the timer */
  stop: () => void;
  /** Reset the timer to 0 and stop */
  reset: () => void;
}

/**
 * Hook for tracking study session time
 * Provides start/stop/reset controls and formatted time display
 */
export function useSessionTimer(
  options: UseSessionTimerOptions = {}
): UseSessionTimerReturn {
  const { autoStart = false, onTick } = options;

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTickRef = useRef(onTick);

  // Keep onTick ref up to date
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => {
          const newValue = prev + 1;
          onTickRef.current?.(newValue);
          return newValue;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsedSeconds(0);
  }, []);

  const formattedTime = formatTime(elapsedSeconds);

  return {
    elapsedSeconds,
    isRunning,
    formattedTime,
    start,
    stop,
    reset,
  };
}
