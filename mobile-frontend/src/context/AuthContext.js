import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  clearAuthToken,
  getCurrentUser,
  getStoredUser,
  isAuthenticated as hasToken,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  setAuthTokens,
  setStoredUser,
} from "../api/client";

const AuthContext = createContext(null);

const DEMO_TOKEN = "fluxion.demo.session";

const buildDemoUser = (email, extra = {}) => {
  const namePart = (email || "trader@fluxion.finance").split("@")[0];
  return {
    id: "demo-user",
    email: email || "trader@fluxion.finance",
    username: extra.username || namePart,
    first_name: extra.first_name || "",
    last_name: extra.last_name || "",
    is_demo: true,
    ...extra,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Restore any persisted session on cold start.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!(await hasToken())) return;
        const cached = await getStoredUser();
        if (cached && mounted) setUser(cached);
        // Refresh from the backend when possible; ignore failures so cached
        // demo/offline sessions keep working.
        try {
          const fresh = await getCurrentUser();
          if (fresh && mounted) {
            setUser(fresh);
            await setStoredUser(fresh);
          }
        } catch {
          /* offline / demo session: keep cached user */
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (value) => {
    setUser(value);
    if (value) await setStoredUser(value);
  }, []);

  const signIn = useCallback(
    async ({ email, password }) => {
      setSubmitting(true);
      try {
        await loginUser(email, password);
        let current;
        try {
          current = await getCurrentUser();
        } catch {
          current = buildDemoUser(email);
        }
        await persist(current);
        return { ok: true };
      } catch (error) {
        // Backend unreachable: create a local demo session so the flow is
        // fully navigable during development.
        if (!error?.response) {
          await setAuthTokens({
            accessToken: DEMO_TOKEN,
            refreshToken: DEMO_TOKEN,
          });
          await persist(buildDemoUser(email));
          return { ok: true, demo: true };
        }
        return {
          ok: false,
          error:
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Invalid email or password.",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [persist],
  );

  const signUp = useCallback(
    async (payload) => {
      setSubmitting(true);
      try {
        await registerUser(payload);
        if (!(await hasToken())) {
          await loginUser(payload.email, payload.password);
        }
        let current;
        try {
          current = await getCurrentUser();
        } catch {
          current = buildDemoUser(payload.email, {
            first_name: payload.first_name,
            last_name: payload.last_name,
          });
        }
        await persist(current);
        return { ok: true };
      } catch (error) {
        if (!error?.response) {
          await setAuthTokens({
            accessToken: DEMO_TOKEN,
            refreshToken: DEMO_TOKEN,
          });
          await persist(
            buildDemoUser(payload.email, {
              first_name: payload.first_name,
              last_name: payload.last_name,
            }),
          );
          return { ok: true, demo: true };
        }
        return {
          ok: false,
          error:
            error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "We could not create your account.",
        };
      } finally {
        setSubmitting(false);
      }
    },
    [persist],
  );

  const signOut = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      await clearAuthToken();
    }
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      await requestPasswordReset(email);
    } catch {
      // Always resolve; we never reveal whether an email is registered.
    }
    return { ok: true };
  }, []);

  const updateUser = useCallback(
    (patch) => {
      const next = { ...(user || {}), ...patch };
      persist(next);
    },
    [persist, user],
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      initializing,
      submitting,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      updateUser,
    }),
    [
      user,
      initializing,
      submitting,
      signIn,
      signUp,
      signOut,
      forgotPassword,
      updateUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default useAuth;
