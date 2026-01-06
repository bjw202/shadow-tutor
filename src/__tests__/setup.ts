import "@testing-library/jest-dom/vitest";

// Mock scrollIntoView for Radix UI components in jsdom
Element.prototype.scrollIntoView = () => {};

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
