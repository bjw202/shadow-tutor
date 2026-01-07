"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle } from "lucide-react";

interface SessionSummaryProps {
  isOpen: boolean;
  sessionTitle: string;
  totalSegments: number;
  completedSegments: number;
  totalStudyTime: number;
  onClose: () => void;
  onRestart: () => void;
}

/**
 * Format seconds into human-readable time string
 */
function formatStudyTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} min`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  if (remainingSeconds > 0 && minutes < 10) {
    return `${minutes} min ${remainingSeconds} sec`;
  }

  return `${minutes} min`;
}

/**
 * Modal dialog showing session completion summary
 */
export function SessionSummary({
  isOpen,
  sessionTitle,
  totalSegments,
  completedSegments,
  totalStudyTime,
  onClose,
  onRestart,
}: SessionSummaryProps) {
  const completionRate = totalSegments > 0 ? completedSegments / totalSegments : 0;
  const percentage = Math.round(completionRate * 100);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex flex-col items-center space-y-2 mb-2">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <AlertDialogTitle className="text-center">
              Session Complete!
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-center">
                Great job finishing{" "}
                <span className="font-medium text-foreground">{sessionTitle}</span>
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {percentage}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Segments Completed</span>
                  <span className="font-medium">{completedSegments}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Segments</span>
                  <span className="font-medium">{totalSegments}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Study Time</span>
                  <span className="font-medium">{formatStudyTime(totalStudyTime)}</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel onClick={onRestart}>Practice Again</AlertDialogCancel>
          <AlertDialogAction onClick={onClose}>Done</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
