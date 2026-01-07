"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useUploadStore } from "@/stores/upload-store";
import { usePracticeStore } from "@/stores/practice-store";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

export default function PracticePage() {
  const router = useRouter();
  const { segments, status } = useUploadStore();
  const { initSession } = usePracticeStore();

  const hasContent = segments.length > 0 && status === "complete";

  const handleStartPractice = () => {
    if (segments.length > 0) {
      initSession(segments);
      router.push("/practice/session");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Home
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start Practice Session</CardTitle>
          <CardDescription>
            Practice your shadowing with the uploaded text
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {hasContent ? (
            <>
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm font-medium">Ready to practice</p>
                <p className="text-sm text-muted-foreground">
                  {segments.length} segments loaded
                </p>
              </div>
              <Button
                onClick={handleStartPractice}
                className="w-full"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                Start Shadowing Practice
              </Button>
            </>
          ) : (
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                No content available. Please upload a text file first.
              </p>
              <Button asChild variant="outline">
                <Link href="/upload">Go to Upload</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
