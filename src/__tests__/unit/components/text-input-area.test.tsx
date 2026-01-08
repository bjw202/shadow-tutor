import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextInputArea } from "@/components/upload/text-input-area";

describe("TextInputArea", () => {
  const mockOnTextChange = vi.fn();
  const mockOnStartPractice = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render textarea with placeholder", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByPlaceholderText(
        /paste.*text|text.*paste/i
      );
      expect(textarea).toBeInTheDocument();
    });

    it("should render character counter", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      expect(screen.getByText(/0.*\/.*10,000/)).toBeInTheDocument();
    });

    it("should render start practice button", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      expect(
        screen.getByRole("button", { name: /start.*practice|practice.*start/i })
      ).toBeInTheDocument();
    });

    it("should have minimum height of 200px", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("min-h-[200px]");
    });
  });

  describe("text input", () => {
    it("should display provided text value", () => {
      render(
        <TextInputArea
          text="Hello, world!"
          charCount={13}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue("Hello, world!");
    });

    it("should call onTextChange when text is entered", async () => {
      const user = userEvent.setup();
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      await user.type(textarea, "Test");

      expect(mockOnTextChange).toHaveBeenCalled();
    });

    it("should display current character count", () => {
      render(
        <TextInputArea
          text="Hello"
          charCount={5}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      expect(screen.getByText(/5.*\/.*10,000/)).toBeInTheDocument();
    });
  });

  describe("character count colors", () => {
    it("should show default color when under 9000 characters", () => {
      render(
        <TextInputArea
          text={"a".repeat(100)}
          charCount={100}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const counter = screen.getByTestId("char-counter");
      expect(counter).not.toHaveClass("text-orange-500");
      expect(counter).not.toHaveClass("text-red-500");
    });

    it("should show warning color (orange) when over 9000 characters", () => {
      render(
        <TextInputArea
          text={"a".repeat(9001)}
          charCount={9001}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const counter = screen.getByTestId("char-counter");
      expect(counter).toHaveClass("text-orange-500");
    });

    it("should show error color (red) when at 10000 characters", () => {
      render(
        <TextInputArea
          text={"a".repeat(10000)}
          charCount={10000}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const counter = screen.getByTestId("char-counter");
      expect(counter).toHaveClass("text-red-500");
    });
  });

  describe("validation", () => {
    it("should display validation error when provided", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          validationError="Please enter text to practice"
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      expect(
        screen.getByText("Please enter text to practice")
      ).toBeInTheDocument();
    });

    it("should not display validation error when not provided", () => {
      render(
        <TextInputArea
          text="Valid text"
          charCount={10}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      expect(
        screen.queryByText(/error|invalid/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("start practice button", () => {
    it("should be disabled when text is empty", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const button = screen.getByRole("button", {
        name: /start.*practice|practice.*start/i,
      });
      expect(button).toBeDisabled();
    });

    it("should be enabled when text has at least 1 character", () => {
      render(
        <TextInputArea
          text="a"
          charCount={1}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const button = screen.getByRole("button", {
        name: /start.*practice|practice.*start/i,
      });
      expect(button).not.toBeDisabled();
    });

    it("should call onStartPractice when clicked", async () => {
      const user = userEvent.setup();
      render(
        <TextInputArea
          text="Practice text"
          charCount={13}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const button = screen.getByRole("button", {
        name: /start.*practice|practice.*start/i,
      });
      await user.click(button);

      expect(mockOnStartPractice).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
      render(
        <TextInputArea
          text="Valid text"
          charCount={10}
          isValid={true}
          disabled={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const button = screen.getByRole("button", {
        name: /start.*practice|practice.*start/i,
      });
      expect(button).toBeDisabled();
    });
  });

  describe("multilingual support", () => {
    it("should handle Korean text", () => {
      const koreanText = "안녕하세요. 오늘 날씨가 좋습니다.";
      render(
        <TextInputArea
          text={koreanText}
          charCount={koreanText.length}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(koreanText);
      expect(screen.getByText(/19.*\/.*10,000/)).toBeInTheDocument();
    });

    it("should handle Chinese text", () => {
      const chineseText = "你好世界！今天天气很好。";
      render(
        <TextInputArea
          text={chineseText}
          charCount={chineseText.length}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(chineseText);
      expect(screen.getByText(/12.*\/.*10,000/)).toBeInTheDocument();
    });

    it("should handle Japanese text", () => {
      const japaneseText = "こんにちは世界！今日はいい天気です。";
      render(
        <TextInputArea
          text={japaneseText}
          charCount={japaneseText.length}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(japaneseText);
      expect(screen.getByText(/18.*\/.*10,000/)).toBeInTheDocument();
    });

    it("should handle mixed Unicode text", () => {
      const mixedText = "Hello! 안녕! こんにちは! 你好!";
      render(
        <TextInputArea
          text={mixedText}
          charCount={mixedText.length}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveValue(mixedText);
    });
  });

  describe("accessibility", () => {
    it("should have accessible label for textarea", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveAccessibleName();
    });

    it("should announce character count to screen readers", () => {
      render(
        <TextInputArea
          text="Test"
          charCount={4}
          isValid={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const counter = screen.getByTestId("char-counter");
      expect(counter).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("disabled state", () => {
    it("should disable textarea when disabled prop is true", () => {
      render(
        <TextInputArea
          text=""
          charCount={0}
          isValid={false}
          disabled={true}
          onTextChange={mockOnTextChange}
          onStartPractice={mockOnStartPractice}
        />
      );

      const textarea = screen.getByRole("textbox");
      expect(textarea).toBeDisabled();
    });
  });
});
