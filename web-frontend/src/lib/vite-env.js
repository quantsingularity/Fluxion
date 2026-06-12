/**
 * Thin wrapper around Vite's `import.meta.env`.
 *
 * This is the ONLY module that references `import.meta`, which Vite statically
 * replaces at build time. Jest cannot parse `import.meta` under its CommonJS
 * transform, so this module is swapped for `src/lib/__mocks__/vite-env.js` via
 * the `moduleNameMapper` entry in package.json's jest config.
 */
export function getViteEnv() {
  return import.meta.env;
}
