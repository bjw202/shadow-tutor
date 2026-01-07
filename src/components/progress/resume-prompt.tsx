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

interface ResumePromptProps {
  isOpen: boolean;
  sessionTitle: string;
  completionRate: number;
  lastSegmentIndex: number;
  totalSegments: number;
  onResume: () => void;
  onStartNew: () => void;
}

/**
 * Modal dialog prompting user to resume previous session or start new
 */
export function ResumePrompt({
  isOpen,
  sessionTitle,
  completionRate,
  lastSegmentIndex,
  totalSegments,
  onResume,
  onStartNew,
}: ResumePromptProps) {
  const percentage = Math.round(completionRate * 100);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Resume Previous Session?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You have an unfinished session for{" "}
                <span className="font-medium text-foreground">{sessionTitle}</span>
              </p>
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress:</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Position:</span>
                  <span>
                    Segment {lastSegmentIndex + 1} of {totalSegments}
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Would you like to continue where you left off or start over?
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStartNew}>Start New</AlertDialogCancel>
          <AlertDialogAction onClick={onResume}>Resume</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
