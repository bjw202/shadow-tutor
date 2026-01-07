import "@testing-library/jest-dom/vitest";

// Mock scrollIntoView for Radix UI components in jsdom
Element.prototype.scrollIntoView = () => {};

// Mock pointer capture methods for Radix UI components
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};

// Mock ResizeObserver for Radix UI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
