interface CustomMatchers<R = unknown> {
  toBeInTheDocument(): R
  toBeVisible(): R
}

declare module 'vitest' {
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

declare global {
  const vi: typeof import('vitest').vi
}

export {}
