import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetSettings } from "@/components/settings/reset-settings";

describe("ResetSettings", () => {
  const defaultProps = {
    onReset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render reset button", () => {
    render(<ResetSettings {...defaultProps} />);

    expect(screen.getByRole("button", { name: /reset to defaults/i })).toBeInTheDocument();
  });

  it("should show confirmation dialog when reset button is clicked", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it("should call onReset when confirmed", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    // Click reset button to open dialog
    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    // Click confirm button
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it("should not call onReset when cancelled", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    // Click reset button to open dialog
    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    // Click cancel button
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onReset).not.toHaveBeenCalled();
  });

  it("should close dialog after confirmation", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    // Click reset button to open dialog
    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    // Click confirm button
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);

    // Dialog should be closed
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it("should close dialog after cancellation", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    // Click reset button to open dialog
    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    // Click cancel button
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Dialog should be closed
    expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
  });

  it("should have accessible dialog", async () => {
    const user = userEvent.setup();
    render(<ResetSettings {...defaultProps} />);

    const resetButton = screen.getByRole("button", { name: /reset to defaults/i });
    await user.click(resetButton);

    // Dialog should have proper role
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});
