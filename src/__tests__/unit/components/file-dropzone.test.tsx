import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FileDropzone } from "@/components/upload/file-dropzone";

// Helper to create a file with working text() method
function createMockFile(content: string, name: string, type: string): File {
  const file = new File([content], name, { type });
  // Mock the text() method since jsdom doesn't fully support it
  file.text = vi.fn().mockResolvedValue(content);
  return file;
}

describe("FileDropzone", () => {
  const mockOnFileSelect = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render dropzone with correct text", () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      expect(
        screen.getByText(/drag and drop/i) || screen.getByText(/drop/i)
      ).toBeInTheDocument();
    });

    it("should render file input", () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const input = document.querySelector('input[type="file"]');
      expect(input).toBeInTheDocument();
    });

    it("should accept only .txt files", () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(input.accept).toBe(".txt");
    });
  });

  describe("file selection", () => {
    it("should accept .txt files", async () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const file = createMockFile("test content", "test.txt", "text/plain");
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
        configurable: true,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file, "test content");
      });
    });

    it("should reject non-.txt files", async () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const file = createMockFile("test content", "test.pdf", "application/pdf");
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
        configurable: true,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining(".txt")
        );
      });
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });

    it("should reject files over 1MB", async () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      // Create a file larger than 1MB
      const largeContent = "x".repeat(1024 * 1024 + 1);
      const file = createMockFile(largeContent, "large.txt", "text/plain");
      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;

      Object.defineProperty(input, "files", {
        value: [file],
        configurable: true,
      });
      fireEvent.change(input);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          expect.stringContaining("1MB")
        );
      });
      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe("drag and drop", () => {
    it("should show visual feedback on drag over", () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const dropzone = screen.getByTestId("dropzone");

      fireEvent.dragEnter(dropzone);
      expect(dropzone).toHaveClass("border-primary");

      fireEvent.dragLeave(dropzone);
      expect(dropzone).not.toHaveClass("border-primary");
    });

    it("should accept dropped .txt files", async () => {
      render(
        <FileDropzone onFileSelect={mockOnFileSelect} onError={mockOnError} />
      );

      const file = createMockFile("dropped content", "dropped.txt", "text/plain");
      const dropzone = screen.getByTestId("dropzone");

      fireEvent.drop(dropzone, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnFileSelect).toHaveBeenCalledWith(file, "dropped content");
      });
    });
  });

  describe("progress display", () => {
    it("should show progress when provided", () => {
      render(
        <FileDropzone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          progress={50}
          isUploading={true}
        />
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should not show progress when not uploading", () => {
      render(
        <FileDropzone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          progress={0}
          isUploading={false}
        />
      );

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("should disable input when disabled prop is true", () => {
      render(
        <FileDropzone
          onFileSelect={mockOnFileSelect}
          onError={mockOnError}
          disabled={true}
        />
      );

      const input = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });
  });
});
