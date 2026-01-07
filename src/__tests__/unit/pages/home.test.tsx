import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock the header component
vi.mock("@/components/layout/header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

// Mock the app store
vi.mock("@/stores/app-store", () => ({
  useAppStore: () => ({
    theme: "system",
    setTheme: vi.fn(),
  }),
}));

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("should render the page title", () => {
      render(<Home />);

      expect(screen.getByText("Shadow Tutor")).toBeInTheDocument();
    });

    it("should render three feature cards", () => {
      render(<Home />);

      expect(screen.getByText("Upload Text")).toBeInTheDocument();
      expect(screen.getByText("Practice")).toBeInTheDocument();
      // "Settings" appears twice (card title and button), use getAllByText
      expect(screen.getAllByText("Settings").length).toBeGreaterThanOrEqual(1);
    });

    it("should render theme toggle buttons", () => {
      render(<Home />);

      expect(screen.getByRole("button", { name: /^light$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^dark$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^system$/i })).toBeInTheDocument();
    });
  });

  describe("navigation links", () => {
    it("should have Upload File button with correct href", () => {
      render(<Home />);

      const uploadLink = screen.getByRole("link", { name: /upload file/i });
      expect(uploadLink).toBeInTheDocument();
      expect(uploadLink).toHaveAttribute("href", "/upload");
    });

    it("should have Start Practice button with correct href", () => {
      render(<Home />);

      const practiceLink = screen.getByRole("link", { name: /start practice/i });
      expect(practiceLink).toBeInTheDocument();
      expect(practiceLink).toHaveAttribute("href", "/practice");
    });

    it("should have Settings button with correct href", () => {
      render(<Home />);

      // Find the link that contains the Settings button
      const settingsLinks = screen.getAllByRole("link");
      const settingsLink = settingsLinks.find(
        (link) => link.getAttribute("href") === "/settings"
      );

      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute("href", "/settings");
    });
  });

  describe("accessibility", () => {
    it("should have accessible button labels", () => {
      render(<Home />);

      // All buttons should be accessible
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);

      // Theme buttons should have text content
      expect(screen.getByRole("button", { name: /light/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /dark/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /system/i })).toBeInTheDocument();
    });
  });
});
