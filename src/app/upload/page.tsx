"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { TextInputArea } from "@/components/upload/text-input-area";
import { InputMethodTabs } from "@/components/upload/input-method-tabs";
import { TextPreview } from "@/components/upload/text-preview";
import { SegmentEditor } from "@/components/upload/segment-editor";
import { useUploadStore } from "@/stores/upload-store";
import { parseText } from "@/lib/utils/text-parser";
import { cn } from "@/lib/utils";
import type { InputMethod, TextInputState } from "@/types";

const MAX_CHAR_COUNT = 10000;

/**
 * Upload page component
 * Provides step-by-step flow: Upload -> Preview -> Confirm
 */
export default function UploadPage() {
  const {
    file,
    content,
    segments,
    status,
    error,
    progress,
    parseMode,
    inputMethod,
    textInput,
    setFile,
    setContent,
    setSegments,
    setStatus,
    setError,
    setProgress,
    setParseMode,
    setInputMethod,
    setTextInput,
    clearContent,
    reset,
  } = useUploadStore();

  /**
   * Handle file selection from dropzone
   */
  const handleFileSelect = React.useCallback(
    (selectedFile: File, fileContent: string) => {
      setFile(selectedFile);
      setContent(fileContent);
      setStatus("parsing");
      setProgress(50);

      // Parse the content
      const parsedSegments = parseText(fileContent, parseMode);
      setSegments(parsedSegments);
      setProgress(100);
      setStatus("complete");
    },
    [parseMode, setFile, setContent, setSegments, setStatus, setProgress]
  );

  /**
   * Handle file upload errors
   */
  const handleError = React.useCallback(
    (message: string) => {
      setError(message);
      setStatus("error");
    },
    [setError, setStatus]
  );

  /**
   * Handle parse mode change
   */
  const handleParseModeChange = React.useCallback(
    (mode: typeof parseMode) => {
      setParseMode(mode);
      // Re-parse if we have content
      if (content) {
        const parsedSegments = parseText(content, mode);
        setSegments(parsedSegments);
      }
    },
    [content, setParseMode, setSegments]
  );

  /**
   * Handle reparse action
   */
  const handleReparse = React.useCallback(() => {
    if (content) {
      setStatus("parsing");
      const parsedSegments = parseText(content, parseMode);
      setSegments(parsedSegments);
      setStatus("complete");
    }
  }, [content, parseMode, setSegments, setStatus]);

  /**
   * Handle confirm action
   */
  const handleConfirm = React.useCallback(() => {
    // TODO: Navigate to practice page or save segments
    console.log("Segments confirmed:", segments);
    alert(`${segments.length} segments confirmed! Ready for practice.`);
  }, [segments]);

  /**
   * Handle reset/start over
   */
  const handleReset = React.useCallback(() => {
    reset();
  }, [reset]);

  /**
   * Handle input method change (tab switch)
   */
  const handleInputMethodChange = React.useCallback(
    (method: InputMethod) => {
      // Clear content when switching tabs
      clearContent();
      setInputMethod(method);
    },
    [clearContent, setInputMethod]
  );

  /**
   * Handle text input change
   */
  const handleTextInputChange = React.useCallback(
    (text: string) => {
      const charCount = text.length;
      const isValid = charCount > 0 && charCount <= MAX_CHAR_COUNT;
      let validationError: string | null = null;

      if (charCount === 0) {
        validationError = null; // No error for empty input
      } else if (charCount > MAX_CHAR_COUNT) {
        validationError = "Maximum 10,000 characters allowed";
      }

      const newTextInput: TextInputState = {
        text,
        charCount,
        isValid,
        validationError,
      };

      setTextInput(newTextInput);
    },
    [setTextInput]
  );

  /**
   * Handle start practice from text input
   */
  const handleStartPracticeFromText = React.useCallback(() => {
    if (textInput.isValid && textInput.text.length > 0) {
      setContent(textInput.text);
      setStatus("parsing");
      setProgress(50);

      // Parse the text content
      const parsedSegments = parseText(textInput.text, parseMode);
      setSegments(parsedSegments);
      setProgress(100);
      setStatus("complete");
    }
  }, [textInput, parseMode, setContent, setSegments, setStatus, setProgress]);

  const hasContent = content.length > 0;
  const isProcessing = status === "uploading" || status === "parsing";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Back Navigation */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Upload Text</h1>
              <p className="text-muted-foreground text-sm">
                Upload a text file to start practicing
              </p>
            </div>
            {hasContent && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                Start Over
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Main Content */}
          <div
            className={cn(
              "grid gap-6",
              hasContent ? "md:grid-cols-2" : "grid-cols-1"
            )}
          >
            {/* Input Method Tabs */}
            <div className={cn(hasContent ? "" : "max-w-xl mx-auto w-full")}>
              <InputMethodTabs
                activeMethod={inputMethod}
                onMethodChange={handleInputMethodChange}
                disabled={isProcessing}
                fileUploadContent={
                  <div>
                    <FileDropzone
                      onFileSelect={handleFileSelect}
                      onError={handleError}
                      progress={progress}
                      isUploading={isProcessing}
                      disabled={isProcessing}
                      className={cn(hasContent ? "h-48" : "h-64")}
                    />
                    {file && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                }
                textInputContent={
                  <TextInputArea
                    text={textInput.text}
                    charCount={textInput.charCount}
                    isValid={textInput.isValid}
                    validationError={textInput.validationError}
                    disabled={isProcessing}
                    onTextChange={handleTextInputChange}
                    onStartPractice={handleStartPracticeFromText}
                  />
                }
              />
            </div>

            {/* Preview Panel */}
            {hasContent && (
              <TextPreview
                segments={segments}
                className="h-[400px]"
              />
            )}
          </div>

          {/* Segment Editor */}
          {hasContent && (
            <SegmentEditor
              parseMode={parseMode}
              segmentCount={segments.length}
              onParseModeChange={handleParseModeChange}
              onReparse={handleReparse}
              onConfirm={handleConfirm}
              disabled={isProcessing}
            />
          )}

          {/* Instructions */}
          {!hasContent && (
            <div className="text-center text-muted-foreground text-sm space-y-2">
              <p>Upload a text file (.txt, up to 1MB) or paste text directly (up to 10,000 characters)</p>
              <p>
                Your text will be split into segments for shadow speaking practice
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
