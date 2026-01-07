import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ShadowingSection } from "@/components/settings/shadowing-section";
import {
  MIN_REPEAT_COUNT,
  MAX_REPEAT_COUNT,
} from "@/lib/constants/settings";

describe("ShadowingSection", () => {
  const defaultProps = {
    pauseDuration: 5,
    repeatCount: 1,
    autoAdvance: true,
    onPauseDurationChange: vi.fn(),
    onRepeatCountChange: vi.fn(),
    onAutoAdvanceChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render shadowing settings section", () => {
    render(<ShadowingSection {...defaultProps} />);

    expect(screen.getByText(/shadowing settings/i)).toBeInTheDocument();
  });

  it("should display current pause duration", () => {
    render(<ShadowingSection {...defaultProps} pauseDuration={10} />);

    expect(screen.getByText(/10s/)).toBeInTheDocument();
  });

  it("should display current repeat count", () => {
    render(<ShadowingSection {...defaultProps} repeatCount={5} />);

    expect(screen.getByText(/5x/)).toBeInTheDocument();
  });

  it("should increment repeat count when + button is clicked", async () => {
    const user = userEvent.setup();
    render(<ShadowingSection {...defaultProps} repeatCount={3} />);

    const incrementButton = screen.getByRole("button", { name: /increase repeat count/i });
    await user.click(incrementButton);

    expect(defaultProps.onRepeatCountChange).toHaveBeenCalledWith(4);
  });

  it("should decrement repeat count when - button is clicked", async () => {
    const user = userEvent.setup();
    render(<ShadowingSection {...defaultProps} repeatCount={3} />);

    const decrementButton = screen.getByRole("button", { name: /decrease repeat count/i });
    await user.click(decrementButton);

    expect(defaultProps.onRepeatCountChange).toHaveBeenCalledWith(2);
  });

  it("should disable decrement button at minimum repeat count", () => {
    render(<ShadowingSection {...defaultProps} repeatCount={MIN_REPEAT_COUNT} />);

    const decrementButton = screen.getByRole("button", { name: /decrease repeat count/i });
    expect(decrementButton).toBeDisabled();
  });

  it("should disable increment button at maximum repeat count", () => {
    render(<ShadowingSection {...defaultProps} repeatCount={MAX_REPEAT_COUNT} />);

    const incrementButton = screen.getByRole("button", { name: /increase repeat count/i });
    expect(incrementButton).toBeDisabled();
  });

  it("should render auto-advance toggle", () => {
    render(<ShadowingSection {...defaultProps} />);

    expect(screen.getByRole("switch", { name: /auto-advance/i })).toBeInTheDocument();
  });

  it("should show auto-advance as checked when enabled", () => {
    render(<ShadowingSection {...defaultProps} autoAdvance={true} />);

    const toggle = screen.getByRole("switch", { name: /auto-advance/i });
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  it("should show auto-advance as unchecked when disabled", () => {
    render(<ShadowingSection {...defaultProps} autoAdvance={false} />);

    const toggle = screen.getByRole("switch", { name: /auto-advance/i });
    expect(toggle).toHaveAttribute("aria-checked", "false");
  });

  it("should call onAutoAdvanceChange when toggle is clicked", async () => {
    const user = userEvent.setup();
    render(<ShadowingSection {...defaultProps} autoAdvance={true} />);

    const toggle = screen.getByRole("switch", { name: /auto-advance/i });
    await user.click(toggle);

    expect(defaultProps.onAutoAdvanceChange).toHaveBeenCalledWith(false);
  });

  it("should have accessible labels for pause duration slider", () => {
    render(<ShadowingSection {...defaultProps} />);

    expect(screen.getByLabelText(/pause duration/i)).toBeInTheDocument();
  });
});
