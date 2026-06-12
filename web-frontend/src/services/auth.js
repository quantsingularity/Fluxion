// Authentication helper for the web frontend.
//
// Centralizes access/refresh token storage and the login/register/logout flow
// against the backend's /api/v1/auth endpoints. The backend wraps successful
// responses as { success, data: { access_token, refresh_token, ... } }.

import { authAPI } from "./api";

const ACCESS_TOKEN_KEY = "fluxion_token";
const REFRESH_TOKEN_KEY = "fluxion_refresh_token";

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (access, refresh) => {
    if (access) localStorage.setItem(ACCESS_TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  isAuthenticated: () => !!localStorage.getItem(ACCESS_TOKEN_KEY),
};

function extractTokens(payload) {
  // Tolerate both the wrapped ({ data: {...} }) and flat shapes.
  const d = payload?.data ?? payload ?? {};
  return {
    access: d.access_token || d.accessToken,
    refresh: d.refresh_token || d.refreshToken,
    mfaRequired: d.mfa_required ?? false,
    raw: d,
  };
}

export async function login(email, password) {
  const res = await authAPI.login({ email, password });
  const { access, refresh, mfaRequired, raw } = extractTokens(res.data);
  if (access) tokenStore.set(access, refresh);
  return { mfaRequired, ...raw };
}

export async function register(payload) {
  // Backend RegisterRequest requires: email, password, confirm_password,
  // terms_accepted, privacy_accepted. Default the confirmation/consent fields
  // from the provided payload so callers can pass a minimal object.
  const body = {
    user_type: "individual",
    ...payload,
    confirm_password: payload.confirm_password ?? payload.password,
    terms_accepted: payload.terms_accepted ?? true,
    privacy_accepted: payload.privacy_accepted ?? true,
  };
  const res = await authAPI.register(body);
  return res.data;
}

export async function logout() {
  try {
    await authAPI.logout();
  } catch {
    // Ignore network/auth errors on logout; clear tokens regardless.
  }
  tokenStore.clear();
}

export async function refreshSession() {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return false;
  try {
    const res = await authAPI.refresh(refresh);
    const { access, refresh: newRefresh } = extractTokens(res.data);
    if (access) {
      tokenStore.set(access, newRefresh || refresh);
      return true;
    }
  } catch {
    tokenStore.clear();
  }
  return false;
}

export async function getCurrentUser() {
  const res = await authAPI.me();
  return res.data?.data ?? res.data;
}
