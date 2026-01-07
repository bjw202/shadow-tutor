"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/layout/header";
import { useAppStore } from "@/stores/app-store";
import { Upload, Play, Settings } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useAppStore();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col gap-8">
          <section className="text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Shadow Tutor
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Improve your English pronunciation through shadow speaking practice
              with AI-powered text-to-speech.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Upload Text</CardTitle>
                <CardDescription>
                  Upload your text files to start practicing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/upload">
                  <Button className="w-full">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Play className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Practice</CardTitle>
                <CardDescription>
                  Listen and repeat with native pronunciation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/practice">
                  <Button variant="secondary" className="w-full">
                    <Play className="mr-2 h-4 w-4" />
                    Start Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Settings className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Customize your practice experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/settings">
                  <Button variant="outline" className="w-full">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>

          <section className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Current theme: {theme}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
