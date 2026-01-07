"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Header component for the settings page
 */
export function SettingsHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-14 items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label="Go back"
          className="h-9 w-9"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>
    </header>
  );
}
