"use client";

import Link from "next/link";
import { Volume2, Upload, Play, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Volume2 className="h-6 w-6" />
          <span className="font-semibold">Shadow Tutor</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/upload">
            <Button variant="ghost" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </Link>
          <Link href="/practice">
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Practice
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
