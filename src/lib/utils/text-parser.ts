import type { ParseMode, TextSegment } from "@/types";

/**
 * Generates a unique ID for a text segment
 */
export function generateSegmentId(): string {
  return `seg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parses text content into segments based on the specified mode
 *
 * @param content - The text content to parse
 * @param mode - The parsing mode (sentence, phrase, or paragraph)
 * @returns Array of TextSegment objects
 */
export function parseText(content: string, mode: ParseMode): TextSegment[] {
  // Handle empty or whitespace-only content
  const trimmed = content.trim();
  if (!trimmed) {
    return [];
  }

  let segments: TextSegment[];

  switch (mode) {
    case "sentence":
      segments = parseSentences(content);
      break;
    case "phrase":
      segments = parsePhrases(content);
      break;
    case "paragraph":
      segments = parseParagraphs(content);
      break;
    default:
      segments = parseSentences(content);
  }

  return segments;
}

/**
 * Splits text into sentences by . ! ? and their fullwidth equivalents
 */
function parseSentences(content: string): TextSegment[] {
  // Match sentences ending with . ! ? or fullwidth equivalents (Japanese/Chinese)
  // Fullwidth: \u3002 (。) \uff01 (!) \uff1f (?)
  const regex = /[^.!?\u3002\uff01\uff1f]+[.!?\u3002\uff01\uff1f]?/g;
  return splitByRegex(content, regex);
}

/**
 * Splits text into phrases by , ; : and sentence terminators
 */
function parsePhrases(content: string): TextSegment[] {
  // Match phrases ending with , ; : . ! ?
  const regex = /[^,;:.!?]+[,;:.!?]?/g;
  return splitByRegex(content, regex);
}

/**
 * Splits text into paragraphs by double newlines
 */
function parseParagraphs(content: string): TextSegment[] {
  // Normalize line endings and split by double newlines
  const normalized = content.replace(/\r\n/g, "\n");
  const parts = normalized.split(/\n\n+/);

  const segments: TextSegment[] = [];
  let currentPosition = 0;

  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart) {
      // Find the actual position in the original content
      const startPosition = content.indexOf(part, currentPosition);
      const endPosition = startPosition + part.length;

      segments.push({
        id: generateSegmentId(),
        text: trimmedPart,
        startPosition,
        endPosition,
      });

      currentPosition = endPosition;
    }
  }

  return segments;
}

/**
 * Helper function to split content by regex and create segments
 */
function splitByRegex(content: string, regex: RegExp): TextSegment[] {
  const matches = content.match(regex);

  if (!matches) {
    return [];
  }

  const segments: TextSegment[] = [];
  let currentPosition = 0;

  for (const match of matches) {
    const trimmedMatch = match.trim();
    if (trimmedMatch) {
      // Find the actual position in the original content
      const startPosition = content.indexOf(match, currentPosition);
      const endPosition = startPosition + match.length;

      segments.push({
        id: generateSegmentId(),
        text: trimmedMatch,
        startPosition,
        endPosition,
      });

      currentPosition = endPosition;
    }
  }

  return segments;
}
