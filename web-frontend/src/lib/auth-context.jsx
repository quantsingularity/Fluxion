import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
  tokenStore,
} from "../services/auth";

const AuthContext = createContext(null);

// Local development fallback: when the backend is unreachable we still want the
// sign in / sign up flow to be demonstrable. This mints a lightweight local
// session so the protected areas of the app can be explored end to end.
const DEMO_TOKEN = "fluxion.demo.session";

function buildDemoUser(email, extra = {}) {
  const namePart = (email || "trader@fluxion.finance").split("@")[0];
  return {
    id: "demo-user",
    email: email || "trader@fluxion.finance",
    username: extra.username || namePart,
    first_name: extra.first_name || "",
    last_name: extra.last_name || "",
    avatar_url: null,
    is_demo: true,
    ...extra,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On first mount, try to restore the session from a stored token.
  useEffect(() => {
    let mounted = true;
    const restore = async () => {
      if (!tokenStore.isAuthenticated()) {
        if (mounted) setIsInitializing(false);
        return;
      }
      // Demo sessions are restored locally without hitting the network.
      const cachedRaw = localStorage.getItem("fluxion_user");
      if (tokenStore.getAccess() === DEMO_TOKEN && cachedRaw) {
        try {
          if (mounted) setUser(JSON.parse(cachedRaw));
        } catch {
          tokenStore.clear();
        }
        if (mounted) setIsInitializing(false);
        return;
      }
      try {
        const current = await getCurrentUser();
        if (mounted) setUser(current);
      } catch {
        tokenStore.clear();
        localStorage.removeItem("fluxion_user");
      } finally {
        if (mounted) setIsInitializing(false);
      }
    };
    restore();
    return () => {
      mounted = false;
    };
  }, []);

  const persistUser = useCallback((value) => {
    setUser(value);
    if (value) {
      localStorage.setItem("fluxion_user", JSON.stringify(value));
    } else {
      localStorage.removeItem("fluxion_user");
    }
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      setIsSubmitting(true);
      try {
        const result = await loginRequest(email, password);
        let current = null;
        try {
          current = await getCurrentUser();
        } catch {
          current = buildDemoUser(email);
        }
        persistUser(current);
        return { ok: true, mfaRequired: result?.mfaRequired ?? false };
      } catch (error) {
        // Backend unavailable: fall back to a local demo session so the flow
        // remains navigable during development.
        if (!error?.response) {
          tokenStore.set(DEMO_TOKEN, DEMO_TOKEN);
          persistUser(buildDemoUser(email));
          return { ok: true, demo: true };
        }
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "Invalid email or password.";
        return { ok: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistUser],
  );

  const signUp = useCallback(
    async (payload) => {
      setIsSubmitting(true);
      try {
        await registerRequest(payload);
        // Most deployments auto-issue a session on register; if not, sign in.
        if (!tokenStore.isAuthenticated()) {
          await loginRequest(payload.email, payload.password);
        }
        let current = null;
        try {
          current = await getCurrentUser();
        } catch {
          current = buildDemoUser(payload.email, {
            first_name: payload.first_name,
            last_name: payload.last_name,
            username: payload.username,
          });
        }
        persistUser(current);
        return { ok: true };
      } catch (error) {
        if (!error?.response) {
          tokenStore.set(DEMO_TOKEN, DEMO_TOKEN);
          persistUser(
            buildDemoUser(payload.email, {
              first_name: payload.first_name,
              last_name: payload.last_name,
              username: payload.username,
            }),
          );
          return { ok: true, demo: true };
        }
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.detail ||
          "We could not create your account. Please try again.";
        return { ok: false, error: message };
      } finally {
        setIsSubmitting(false);
      }
    },
    [persistUser],
  );

  const signOut = useCallback(async () => {
    if (tokenStore.getAccess() !== DEMO_TOKEN) {
      await logoutRequest();
    } else {
      tokenStore.clear();
    }
    persistUser(null);
  }, [persistUser]);

  const updateUser = useCallback(
    (patch) => {
      persistUser({ ...(user || {}), ...patch });
    },
    [persistUser, user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isInitializing,
      isSubmitting,
      signIn,
      signUp,
      signOut,
      updateUser,
    }),
    [user, isInitializing, isSubmitting, signIn, signUp, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default useAuth;
