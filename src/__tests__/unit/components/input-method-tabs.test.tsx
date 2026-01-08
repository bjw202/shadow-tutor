import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputMethodTabs } from "@/components/upload/input-method-tabs";
import type { InputMethod } from "@/types";

describe("InputMethodTabs", () => {
  const mockOnMethodChange = vi.fn();
  const mockFileUploadContent = <div data-testid="file-upload">File Upload Content</div>;
  const mockTextInputContent = <div data-testid="text-input">Text Input Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render two tabs", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
    });

    it("should render 'File Upload' tab", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByRole("tab", { name: /file.*upload/i })).toBeInTheDocument();
    });

    it("should render 'Text Paste' tab", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByRole("tab", { name: /text.*paste/i })).toBeInTheDocument();
    });

    it("should render file upload content when file method is active", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByTestId("file-upload")).toBeInTheDocument();
    });

    it("should render text input content when text method is active", () => {
      render(
        <InputMethodTabs
          activeMethod="text"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByTestId("text-input")).toBeInTheDocument();
    });
  });

  describe("tab switching", () => {
    it("should call onMethodChange with 'text' when Text Paste tab is clicked", async () => {
      const user = userEvent.setup();
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const textTab = screen.getByRole("tab", { name: /text.*paste/i });
      await user.click(textTab);

      expect(mockOnMethodChange).toHaveBeenCalledWith("text");
    });

    it("should call onMethodChange with 'file' when File Upload tab is clicked", async () => {
      const user = userEvent.setup();
      render(
        <InputMethodTabs
          activeMethod="text"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const fileTab = screen.getByRole("tab", { name: /file.*upload/i });
      await user.click(fileTab);

      expect(mockOnMethodChange).toHaveBeenCalledWith("file");
    });
  });

  describe("tab active state", () => {
    it("should mark File Upload tab as active when activeMethod is file", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const fileTab = screen.getByRole("tab", { name: /file.*upload/i });
      expect(fileTab).toHaveAttribute("aria-selected", "true");
    });

    it("should mark Text Paste tab as active when activeMethod is text", () => {
      render(
        <InputMethodTabs
          activeMethod="text"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const textTab = screen.getByRole("tab", { name: /text.*paste/i });
      expect(textTab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("accessibility", () => {
    it("should have tablist role for tabs container", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("should have tabpanel role for content area", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      expect(screen.getByRole("tabpanel")).toBeInTheDocument();
    });

    it("should support keyboard navigation with arrow keys", async () => {
      const user = userEvent.setup();
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const fileTab = screen.getByRole("tab", { name: /file.*upload/i });
      fileTab.focus();

      await user.keyboard("{ArrowRight}");

      // After arrow key, the text tab should receive focus
      const textTab = screen.getByRole("tab", { name: /text.*paste/i });
      expect(textTab).toHaveFocus();
    });
  });

  describe("tab styling", () => {
    it("should have equal width tabs", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
        />
      );

      const tabList = screen.getByRole("tablist");
      expect(tabList).toHaveClass("w-full");
    });
  });

  describe("disabled state", () => {
    it("should disable all tabs when disabled prop is true", () => {
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
          disabled={true}
        />
      );

      const tabs = screen.getAllByRole("tab");
      tabs.forEach((tab) => {
        expect(tab).toBeDisabled();
      });
    });

    it("should not call onMethodChange when disabled", async () => {
      const user = userEvent.setup();
      render(
        <InputMethodTabs
          activeMethod="file"
          onMethodChange={mockOnMethodChange}
          fileUploadContent={mockFileUploadContent}
          textInputContent={mockTextInputContent}
          disabled={true}
        />
      );

      const textTab = screen.getByRole("tab", { name: /text.*paste/i });
      await user.click(textTab);

      expect(mockOnMethodChange).not.toHaveBeenCalled();
    });
  });
});
