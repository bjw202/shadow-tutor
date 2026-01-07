import type { TTSRequest, TTSResponse, TTSErrorResponse } from "@/types/audio";

/**
 * Generate speech from text using the TTS API
 * @param request - TTS request containing text, voice, and optional speed
 * @returns Promise resolving to TTSResponse with audio data
 * @throws Error if the API returns an error response
 */
export async function generateSpeech(request: TTSRequest): Promise<TTSResponse> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData: TTSErrorResponse = await response.json();
    throw new Error(errorData.error);
  }

  return response.json();
}

/**
 * Convert base64 audio data to a data URL for audio playback
 * @param base64 - Base64 encoded audio data
 * @param contentType - Audio content type (default: "audio/mpeg")
 * @returns Data URL string for use in audio elements
 */
export function base64ToAudioUrl(
  base64: string,
  contentType: string = "audio/mpeg"
): string {
  return `data:${contentType};base64,${base64}`;
}
