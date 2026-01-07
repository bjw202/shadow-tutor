import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar } from "@/components/progress/progress-bar";

// Mock the progress store
vi.mock("@/stores/progress-store", () => ({
  useProgressStore: vi.fn((selector) => {
    const state = {
      currentSession: {
        id: "session-1",
        totalSegments: 10,
        segmentProgress: [
          { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 1 },
          { segmentId: "seg-2", status: "completed", completedAt: Date.now(), repeatCount: 1 },
          { segmentId: "seg-3", status: "completed", completedAt: Date.now(), repeatCount: 1 },
          { segmentId: "seg-4", status: "in_progress", completedAt: null, repeatCount: 0 },
        ],
      },
      getCompletionRate: () => 0.3,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return selector ? selector(state as any) : state;
  }),
}));

describe("ProgressBar", () => {
  describe("rendering", () => {
    it("should render progress bar", () => {
      render(<ProgressBar />);

      // Should have a progress bar element
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toBeInTheDocument();
    });

    it("should display completion percentage", () => {
      render(<ProgressBar />);

      // Should show percentage text
      expect(screen.getByText(/30%/)).toBeInTheDocument();
    });

    it("should display completed segments count", () => {
      render(<ProgressBar />);

      // Should show "3 / 10" or similar format
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  describe("progress visualization", () => {
    it("should set correct aria-valuenow", () => {
      render(<ProgressBar />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "30");
    });

    it("should set aria-valuemin to 0", () => {
      render(<ProgressBar />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
    });

    it("should set aria-valuemax to 100", () => {
      render(<ProgressBar />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  });

  describe("styling", () => {
    it("should have animation class for progress fill", () => {
      render(<ProgressBar />);

      const progressBar = screen.getByRole("progressbar");
      const progressFill = progressBar.querySelector('[data-testid="progress-fill"]');
      expect(progressFill).toBeInTheDocument();
    });
  });

  describe("no session state", () => {
    it("should show 0% when no session", async () => {
      const { useProgressStore } = await import("@/stores/progress-store");
      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: null,
          getCompletionRate: () => 0,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      render(<ProgressBar />);

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });
  });

  describe("100% completion", () => {
    it("should show 100% when all completed", async () => {
      const { useProgressStore } = await import("@/stores/progress-store");
      vi.mocked(useProgressStore).mockImplementation((selector) => {
        const state = {
          currentSession: {
            id: "session-1",
            totalSegments: 5,
            segmentProgress: [
              { segmentId: "seg-1", status: "completed", completedAt: Date.now(), repeatCount: 1 },
              { segmentId: "seg-2", status: "completed", completedAt: Date.now(), repeatCount: 1 },
              { segmentId: "seg-3", status: "completed", completedAt: Date.now(), repeatCount: 1 },
              { segmentId: "seg-4", status: "completed", completedAt: Date.now(), repeatCount: 1 },
              { segmentId: "seg-5", status: "completed", completedAt: Date.now(), repeatCount: 1 },
            ],
          },
          getCompletionRate: () => 1,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return selector ? selector(state as any) : state;
      });

      render(<ProgressBar />);

      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });
  });
});
