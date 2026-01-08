"use client";

import * as React from "react";
import { Upload, FileText } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { InputMethod } from "@/types";

interface InputMethodTabsProps {
  /** Currently active input method */
  activeMethod: InputMethod;
  /** Callback when method changes */
  onMethodChange: (method: InputMethod) => void;
  /** Content to render for file upload tab */
  fileUploadContent: React.ReactNode;
  /** Content to render for text input tab */
  textInputContent: React.ReactNode;
  /** Whether the tabs are disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Tabs component for switching between file upload and text paste input methods
 */
export function InputMethodTabs({
  activeMethod,
  onMethodChange,
  fileUploadContent,
  textInputContent,
  disabled = false,
  className,
}: InputMethodTabsProps) {
  /**
   * Handle tab value change
   */
  const handleValueChange = React.useCallback(
    (value: string) => {
      if (!disabled) {
        onMethodChange(value as InputMethod);
      }
    },
    [disabled, onMethodChange]
  );

  return (
    <Tabs
      value={activeMethod}
      onValueChange={handleValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="w-full grid grid-cols-2">
        <TabsTrigger
          value="file"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          File Upload
        </TabsTrigger>
        <TabsTrigger
          value="text"
          disabled={disabled}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Text Paste
        </TabsTrigger>
      </TabsList>

      <TabsContent value="file" className="mt-4">
        {fileUploadContent}
      </TabsContent>

      <TabsContent value="text" className="mt-4">
        {textInputContent}
      </TabsContent>
    </Tabs>
  );
}
