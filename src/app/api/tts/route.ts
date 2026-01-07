import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { MAX_TEXT_LENGTH } from "@/lib/constants/voices";
import type { TTSResponse, TTSErrorResponse, TTSErrorCode } from "@/types/audio";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

type ValidVoice = (typeof VALID_VOICES)[number];

function isValidVoice(voice: unknown): voice is ValidVoice {
  return typeof voice === "string" && VALID_VOICES.includes(voice as ValidVoice);
}

function createErrorResponse(
  error: string,
  code: TTSErrorCode,
  status: number
): NextResponse<TTSErrorResponse> {
  return NextResponse.json({ error, code }, { status });
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<TTSResponse | TTSErrorResponse>> {
  try {
    const body = await request.json();
    const { text, voice, speed = 1.0 } = body;

    // Validation: text is required and must be a string
    if (!text || typeof text !== "string") {
      return createErrorResponse("Text is required", "INVALID_INPUT", 400);
    }

    // Validation: text cannot be empty
    if (text.length === 0) {
      return createErrorResponse("Text cannot be empty", "INVALID_INPUT", 400);
    }

    // Validation: text length
    if (text.length > MAX_TEXT_LENGTH) {
      return createErrorResponse(
        `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`,
        "TEXT_TOO_LONG",
        400
      );
    }

    // Validation: voice
    if (!isValidVoice(voice)) {
      return createErrorResponse("Invalid voice option", "INVALID_INPUT", 400);
    }

    // Validation: speed (OpenAI supports 0.25 to 4.0)
    if (typeof speed !== "number" || speed < 0.25 || speed > 4.0) {
      return createErrorResponse(
        "Speed must be between 0.25 and 4.0",
        "INVALID_INPUT",
        400
      );
    }

    // Call OpenAI TTS API
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: voice,
      input: text,
      speed,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const audioData = buffer.toString("base64");

    return NextResponse.json({
      audioData,
      contentType: "audio/mpeg",
    });
  } catch (error) {
    console.error("TTS API Error:", error);

    // Handle OpenAI specific errors
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return createErrorResponse(
          "Rate limit exceeded",
          "RATE_LIMITED",
          429
        );
      }
    }

    return createErrorResponse(
      "Failed to generate speech",
      "API_ERROR",
      500
    );
  }
}
