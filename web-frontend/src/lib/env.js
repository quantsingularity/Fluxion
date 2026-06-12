/**
 * Environment variable access that works in both the Vite build and the
 * Jest/Node test runner.
 *
 * Vite statically replaces `import.meta.env.VITE_*` at build time; that access
 * is isolated in `./vite-env.js`, which Jest swaps for a mock (it cannot parse
 * `import.meta`). In tests we additionally fall back to `process.env` so values
 * can be injected.
 */
import { getViteEnv } from "./vite-env";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function readViteEnv() {
  try {
    return getViteEnv();
  } catch {
    return undefined;
  }
}

function readProcessEnv() {
  try {
    return typeof process !== "undefined" && process.env
      ? process.env
      : undefined;
  } catch {
    return undefined;
  }
}

function getEnv(key, fallback = undefined) {
  const viteEnv = readViteEnv();
  if (viteEnv && viteEnv[key] !== undefined && viteEnv[key] !== "") {
    return viteEnv[key];
  }
  const procEnv = readProcessEnv();
  if (procEnv && procEnv[key] !== undefined && procEnv[key] !== "") {
    return procEnv[key];
  }
  return fallback;
}

export const env = {
  POOL_MANAGER_ADDRESS: () => getEnv("VITE_POOL_MANAGER_ADDRESS", ZERO_ADDRESS),
  FACTORY_ADDRESS: () => getEnv("VITE_FACTORY_ADDRESS", ZERO_ADDRESS),
  API_BASE_URL: () => getEnv("VITE_API_BASE_URL", "/api"),
  get: getEnv,
};

export { ZERO_ADDRESS };
export default env;
