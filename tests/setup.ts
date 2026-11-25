import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  class MockResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver = window.ResizeObserver || MockResizeObserver;
  global.ResizeObserver = global.ResizeObserver || MockResizeObserver;

  if (!window.HTMLElement.prototype.scrollIntoView) {
    window.HTMLElement.prototype.scrollIntoView = () => {};
  }
}

