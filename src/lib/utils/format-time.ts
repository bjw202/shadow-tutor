/**
 * Formats seconds into a time string (M:SS or MM:SS format)
 * @param seconds - The number of seconds to format
 * @returns Formatted time string in "M:SS" format (e.g., "1:30", "10:05")
 */
export function formatTime(seconds: number): string {
  // Handle edge cases: NaN, Infinity, negative values
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  // Floor the seconds to handle decimal values
  const totalSeconds = Math.floor(seconds);

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  // Pad seconds with leading zero if needed
  const paddedSeconds = remainingSeconds.toString().padStart(2, "0");

  return `${minutes}:${paddedSeconds}`;
}
