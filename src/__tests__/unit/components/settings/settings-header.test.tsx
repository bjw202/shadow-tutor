import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsHeader } from "@/components/settings/settings-header";

// Mock next/navigation
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

describe("SettingsHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the header with title", () => {
    render(<SettingsHeader />);

    expect(screen.getByRole("heading", { name: /settings/i })).toBeInTheDocument();
  });

  it("should render the back button", () => {
    render(<SettingsHeader />);

    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("should call router.back when back button is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsHeader />);

    const backButton = screen.getByRole("button", { name: /back/i });
    await user.click(backButton);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("should have accessible navigation", () => {
    render(<SettingsHeader />);

    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();
  });
});
