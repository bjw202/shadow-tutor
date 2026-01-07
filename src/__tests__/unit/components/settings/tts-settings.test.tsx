import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TTSSettings } from "@/components/settings/tts-settings";
import type { VoiceOption } from "@/types/audio";

describe("TTSSettings", () => {
  const defaultProps = {
    voice: "nova" as VoiceOption,
    speed: 1.0,
    volume: 1.0,
    isMuted: false,
    onVoiceChange: vi.fn(),
    onSpeedChange: vi.fn(),
    onVolumeChange: vi.fn(),
    onMuteToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render TTS settings section", () => {
    render(<TTSSettings {...defaultProps} />);

    expect(screen.getByText(/tts settings/i)).toBeInTheDocument();
  });

  it("should display current voice selection", () => {
    render(<TTSSettings {...defaultProps} voice="echo" />);

    expect(screen.getByText(/echo/i)).toBeInTheDocument();
  });

  it("should call onVoiceChange when voice is selected", async () => {
    const user = userEvent.setup();
    render(<TTSSettings {...defaultProps} />);

    // Open the voice selector dropdown
    const voiceTrigger = screen.getByRole("combobox", { name: /select voice/i });
    await user.click(voiceTrigger);

    // Select a different voice
    const echoOption = screen.getByRole("option", { name: /echo/i });
    await user.click(echoOption);

    expect(defaultProps.onVoiceChange).toHaveBeenCalledWith("echo");
  });

  it("should display current speed value", () => {
    render(<TTSSettings {...defaultProps} speed={1.5} />);

    expect(screen.getByText(/1\.50x/i)).toBeInTheDocument();
  });

  it("should call onSpeedChange when speed preset is clicked", async () => {
    const user = userEvent.setup();
    render(<TTSSettings {...defaultProps} />);

    const speedPreset = screen.getByRole("button", { name: /0\.75x/i });
    await user.click(speedPreset);

    expect(defaultProps.onSpeedChange).toHaveBeenCalledWith(0.75);
  });

  it("should render volume control", () => {
    render(<TTSSettings {...defaultProps} />);

    expect(screen.getByRole("button", { name: /mute|unmute/i })).toBeInTheDocument();
  });

  it("should call onMuteToggle when mute button is clicked", async () => {
    const user = userEvent.setup();
    render(<TTSSettings {...defaultProps} />);

    const muteButton = screen.getByRole("button", { name: /mute volume/i });
    await user.click(muteButton);

    expect(defaultProps.onMuteToggle).toHaveBeenCalledTimes(1);
  });

  it("should show muted icon when isMuted is true", () => {
    render(<TTSSettings {...defaultProps} isMuted={true} />);

    expect(screen.getByTestId("volume-muted")).toBeInTheDocument();
  });

  it("should have accessible labels for all controls", () => {
    render(<TTSSettings {...defaultProps} />);

    // Check playback speed slider has aria-label
    expect(screen.getByLabelText(/playback speed/i)).toBeInTheDocument();
    // Check voice selector has aria-label
    expect(screen.getByRole("combobox", { name: /select voice/i })).toBeInTheDocument();
  });
});
