"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_CHAR_COUNT = 10000;
const WARNING_THRESHOLD = 9000;

interface TextInputAreaProps {
  /** Current text value */
  text: string;
  /** Current character count */
  charCount: number;
  /** Whether the text is valid for practice */
  isValid: boolean;
  /** Validation error message */
  validationError?: string | null;
  /** Whether the component is disabled */
  disabled?: boolean;
  /** Callback when text changes */
  onTextChange: (text: string) => void;
  /** Callback when start practice is clicked */
  onStartPractice: () => void;
  /** Additional class names */
  className?: string;
}

/**
 * Get the color class for the character counter based on count
 */
function getCounterColorClass(charCount: number): string {
  if (charCount >= MAX_CHAR_COUNT) {
    return "text-red-500";
  }
  if (charCount > WARNING_THRESHOLD) {
    return "text-orange-500";
  }
  return "text-muted-foreground";
}

/**
 * Text input area component for direct text paste/input
 * Supports multilingual text including Korean, Chinese, Japanese, and all Unicode characters
 */
export function TextInputArea({
  text,
  charCount,
  isValid,
  validationError,
  disabled = false,
  onTextChange,
  onStartPractice,
  className,
}: TextInputAreaProps) {
  /**
   * Handle text input change
   */
  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = event.target.value;
      // Block input if over max character count
      if (newText.length <= MAX_CHAR_COUNT) {
        onTextChange(newText);
      }
    },
    [onTextChange]
  );

  const canStartPractice = charCount > 0 && isValid && !disabled;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Text Input Area */}
      <div className="relative">
        <label htmlFor="practice-text" className="sr-only">
          Practice text input
        </label>
        <Textarea
          id="practice-text"
          value={text}
          onChange={handleChange}
          placeholder="Paste the text you want to practice here..."
          disabled={disabled}
          className="min-h-[200px] resize-y"
          aria-describedby="char-counter"
        />
      </div>

      {/* Character Counter */}
      <div className="flex items-center justify-between">
        <div
          id="char-counter"
          data-testid="char-counter"
          aria-live="polite"
          className={cn(
            "text-sm",
            getCounterColorClass(charCount)
          )}
        >
          {charCount.toLocaleString()} / {MAX_CHAR_COUNT.toLocaleString()}
        </div>

        {/* Start Practice Button */}
        <Button
          onClick={onStartPractice}
          disabled={!canStartPractice}
        >
          Start Practice
        </Button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}
    </div>
  );
}
