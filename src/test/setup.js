import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for jsdom
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {}
  };
};

// Mock window.open
window.open = vi.fn();

// Mock GSAP to prevent visual timeline issues in testing environment
vi.mock('gsap', () => {
  const gsapMock = {
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    context: vi.fn((cb) => {
      const mockCtx = { revert: vi.fn() };
      cb(mockCtx);
      return mockCtx;
    }),
    matchMedia: vi.fn(() => ({
      add: vi.fn((queries, cb) => {
        cb({ conditions: { isDesktop: true, isMobile: false } });
      }),
      revert: vi.fn()
    }))
  };
  return {
    default: gsapMock,
    gsap: gsapMock
  };
});

vi.mock('gsap/ScrollTrigger', () => {
  return {
    ScrollTrigger: {
      registerPlugin: vi.fn(),
      update: vi.fn(),
      refresh: vi.fn()
    },
    default: {
      registerPlugin: vi.fn(),
      update: vi.fn(),
      refresh: vi.fn()
    }
  };
});
