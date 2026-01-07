import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VoiceSelector } from "@/components/practice/voice-selector";

describe("VoiceSelector", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render voice selector", () => {
      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    it("should render title header", () => {
      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      expect(screen.getByText("Voice")).toBeInTheDocument();
    });

    it("should accept className prop", () => {
      const { container } = render(
        <VoiceSelector
          value="nova"
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const card = container.firstChild;
      expect(card).toHaveClass("custom-class");
    });

    it("should have aria-label for accessibility", () => {
      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      expect(
        screen.getByRole("combobox", { name: /select voice/i })
      ).toBeInTheDocument();
    });
  });

  describe("current selection display", () => {
    it("should display Nova when nova is selected", () => {
      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      expect(screen.getByText("Nova")).toBeInTheDocument();
      expect(screen.getByText("Friendly, upbeat")).toBeInTheDocument();
    });

    it("should display Alloy when alloy is selected", () => {
      render(<VoiceSelector value="alloy" onChange={mockOnChange} />);

      expect(screen.getByText("Alloy")).toBeInTheDocument();
      expect(screen.getByText("Neutral, balanced")).toBeInTheDocument();
    });

    it("should display Echo when echo is selected", () => {
      render(<VoiceSelector value="echo" onChange={mockOnChange} />);

      expect(screen.getByText("Echo")).toBeInTheDocument();
      expect(screen.getByText("Warm, conversational")).toBeInTheDocument();
    });

    it("should display Fable when fable is selected", () => {
      render(<VoiceSelector value="fable" onChange={mockOnChange} />);

      expect(screen.getByText("Fable")).toBeInTheDocument();
      expect(screen.getByText("Expressive, narrative")).toBeInTheDocument();
    });

    it("should display Onyx when onyx is selected", () => {
      render(<VoiceSelector value="onyx" onChange={mockOnChange} />);

      expect(screen.getByText("Onyx")).toBeInTheDocument();
      expect(screen.getByText("Deep, authoritative")).toBeInTheDocument();
    });

    it("should display Shimmer when shimmer is selected", () => {
      render(<VoiceSelector value="shimmer" onChange={mockOnChange} />);

      expect(screen.getByText("Shimmer")).toBeInTheDocument();
      expect(screen.getByText("Clear, professional")).toBeInTheDocument();
    });

    it("should update displayed value when value prop changes", () => {
      const { rerender } = render(
        <VoiceSelector value="nova" onChange={mockOnChange} />
      );

      expect(screen.getByText("Nova")).toBeInTheDocument();

      rerender(<VoiceSelector value="alloy" onChange={mockOnChange} />);

      expect(screen.getByText("Alloy")).toBeInTheDocument();
    });
  });

  describe("dropdown interaction", () => {
    it("should open dropdown when clicked", async () => {
      const user = userEvent.setup();

      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      const combobox = screen.getByRole("combobox");
      await user.click(combobox);

      // After clicking, the combobox should have expanded state
      await waitFor(() => {
        expect(combobox).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("should show all voice options in dropdown", async () => {
      const user = userEvent.setup();

      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      await user.click(screen.getByRole("combobox"));

      // Wait for dropdown to open and check for options
      await waitFor(() => {
        // Check that all 6 voice options exist as selectable options
        expect(screen.getAllByRole("option")).toHaveLength(6);
      });
    });

    it("should call onChange when a different voice is selected", async () => {
      const user = userEvent.setup();

      render(<VoiceSelector value="nova" onChange={mockOnChange} />);

      await user.click(screen.getByRole("combobox"));

      // Wait for dropdown to be visible and select an option
      await waitFor(async () => {
        const options = screen.getAllByRole("option");
        // Find and click the Alloy option
        const alloyOption = options.find(
          (opt) => opt.textContent?.includes("Alloy")
        );
        if (alloyOption) {
          await user.click(alloyOption);
        }
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith("alloy");
      });
    });
  });

  describe("voice metadata", () => {
    it("should show voice name in the trigger", () => {
      render(<VoiceSelector value="echo" onChange={mockOnChange} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("Echo");
    });

    it("should show voice description in the trigger", () => {
      render(<VoiceSelector value="onyx" onChange={mockOnChange} />);

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("Deep, authoritative");
    });
  });
});
