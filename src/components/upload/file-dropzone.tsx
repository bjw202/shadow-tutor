"use client";

import * as React from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

interface FileDropzoneProps {
  /** Callback when a valid file is selected */
  onFileSelect: (file: File, content: string) => void;
  /** Callback when an error occurs */
  onError: (message: string) => void;
  /** Upload progress (0-100) */
  progress?: number;
  /** Whether file is currently uploading */
  isUploading?: boolean;
  /** Whether the dropzone is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * File dropzone component for uploading text files
 * Supports drag and drop as well as click to select
 */
export function FileDropzone({
  onFileSelect,
  onError,
  progress = 0,
  isUploading = false,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  /**
   * Validates the file and reads its content
   */
  const processFile = React.useCallback(
    async (file: File) => {
      // Validate file extension
      if (!file.name.toLowerCase().endsWith(".txt")) {
        onError("Only .txt files are allowed");
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        onError("File size must be less than 1MB");
        return;
      }

      // Read file content
      try {
        const content = await file.text();
        onFileSelect(file, content);
      } catch {
        onError("Failed to read file");
      }
    },
    [onFileSelect, onError]
  );

  /**
   * Handle file input change
   */
  const handleFileChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset input value to allow selecting the same file again
      event.target.value = "";
    },
    [processFile]
  );

  /**
   * Handle drag events
   */
  const handleDragEnter = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);
    },
    []
  );

  const handleDragOver = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    },
    []
  );

  const handleDrop = React.useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const file = event.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, processFile]
  );

  /**
   * Handle click to open file dialog
   */
  const handleClick = React.useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  return (
    <Card
      data-testid="dropzone"
      className={cn(
        "relative flex flex-col items-center justify-center p-8 border-2 border-dashed cursor-pointer transition-colors",
        isDragOver && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        disabled={disabled}
        className="sr-only"
        aria-label="Upload text file"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="text-muted-foreground">Uploading...</div>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="w-full h-2 bg-secondary rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-sm text-muted-foreground">{progress}%</div>
        </div>
      ) : (
        <>
          <Upload className="h-10 w-10 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium">
              Drag and drop your text file here
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to select a file
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Only .txt files up to 1MB
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
