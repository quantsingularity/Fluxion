// Jest replacement for vite-env.js (which uses import.meta, unparseable by
// babel-jest's CommonJS transform). Returns undefined so the env helper falls
// back to process.env / defaults during tests.
export function getViteEnv() {
  return undefined;
}
