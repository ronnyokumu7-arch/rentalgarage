// src/context/auth-context.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient, { registerRefreshHandler } from "@/lib/api-client";
import { AuthState, User, Tenant, LoginResponse } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<boolean>;
  refreshTenant: () => Promise<void>;
  /**
   * Single-flight refresh queue: multiple 401s queue behind ONE refresh.
   * Returns true if tokens were rotated, false if refresh definitively failed.
   * Callers should ONLY logout when this returns false AND the error was 401
   * (not network).
   */
  refreshQueue: (onSuccess: () => void, onFailure: () => void) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Keep-alive cadence: shorter than 15-min access token TTL
const KEEP_ALIVE_INTERVAL_MS = 10 * 60 * 1000;

// ─── CROSS-TAB SYNCHRONIZATION ─────────────────────────────────────────────
const channel = typeof window !== "undefined" && "BroadcastChannel" in window
  ? new BroadcastChannel("auth_channel")
  : null;

// ─── TOKEN STORAGE (localStorage + cookie for middleware) ──────────────────
const ACCESS_KEY = "rm_token";
const REFRESH_KEY = "rm_refresh_token";

const getAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
};

const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
};

/**
 * Store access token in BOTH localStorage (for API calls) and a first-party
 * cookie (for Next.js middleware edge validation). The cookie is NOT HttpOnly
 * since middleware runs before React hydration and can't access localStorage.
 */
const setAccessToken = (accessToken: string) => {
  if (typeof window === "undefined") return;
  
  localStorage.setItem(ACCESS_KEY, accessToken);
  
  const isSecure = window.location.protocol === "https:";
  const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString();
  document.cookie = `${ACCESS_KEY}=${encodeURIComponent(accessToken)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
};

const setRefreshToken = (refreshToken: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(REFRESH_KEY, refreshToken);
};

const setTokens = (accessToken: string, refreshToken?: string | null) => {
  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
};

const removeAuthTokens = () => {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  
  document.cookie = `${ACCESS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = "rm_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// ─── TENANT CACHE ──────────────────────────────────────────────────────────
let cachedTenant: Tenant | null = null;
let tenantCacheTimestamp = 0;
const TENANT_CACHE_TTL = 5 * 60 * 1000;

async function fetchTenant(tenantId: number, forceRefresh = false): Promise<Tenant | null> {
  const now = Date.now();
  if (!forceRefresh && cachedTenant && (now - tenantCacheTimestamp) < TENANT_CACHE_TTL) {
    return cachedTenant;
  }
  try {
    const res = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
    cachedTenant = res.data;
    tenantCacheTimestamp = now;
    return res.data;
  } catch {
    return null;
  }
}

function clearTenantCache() {
  cachedTenant = null;
  tenantCacheTimestamp = 0;
}

// ─── AUTH PROVIDER ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // ✅ Single-flight refresh queue state
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const refreshSubscribersRef = useRef<Array<{
    onSuccess: () => void;
    onFailure: () => void;
  }>>([]);

  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * ✅ SINGLE-FLIGHT REFRESH: only one refresh runs at a time.
   * Other 401s queue behind it and retry/reject when it completes.
   * Returns true if tokens rotated, false if refresh endpoint rejected (401).
   * Network errors retry once before failing.
   */
  const rotateTokens = useCallback(async (): Promise<boolean> => {
    const refresh_token = getRefreshToken();
    if (!refresh_token) return false;

    try {
      const res = await apiClient.post<LoginResponse>("/auth/refresh", { refresh_token });
      const { access_token, refresh_token: new_refresh, user } = res.data;

      setTokens(access_token, new_refresh);

      const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

      setState({
        user,
        tenant,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      channel?.postMessage({ type: "tokens_rotated", access_token });
      return true;
    } catch (error: any) {
      // ✅ Retry once on network errors (not on 401/403 from backend)
      const isAuthFailure = error?.response?.status === 401 || error?.response?.status === 403;
      if (!isAuthFailure) {
        // Network blip or server 5xx — retry once after 1s
        await new Promise((resolve) => setTimeout(resolve, 1000));
        try {
          const retryRes = await apiClient.post<LoginResponse>("/auth/refresh", { refresh_token });
          const { access_token, refresh_token: new_refresh, user } = retryRes.data;

          setTokens(access_token, new_refresh);

          const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

          setState({
            user,
            tenant,
            token: access_token,
            isLoading: false,
            isAuthenticated: true,
          });

          channel?.postMessage({ type: "tokens_rotated", access_token });
          return true;
        } catch (retryError: any) {
          const retryWasAuthFailure = retryError?.response?.status === 401 || retryError?.response?.status === 403;
          if (retryWasAuthFailure) return false;
          // Preserve the session on transient backend/network failures. The
          // interceptor will surface the request failure without logging out.
          throw retryError;
        }
      }
      // Auth failure (401/403 from /auth/refresh) — refresh token is dead
      return false;
    }
  }, []);

  // Register the actual refresh path used by Axios before protected screens
  // make requests. This was previously never registered, so the first access
  // token expiry caused an immediate client-side logout.
  useEffect(() => {
    registerRefreshHandler(async () => {
      const rotated = await rotateTokens();
      return rotated ? getAccessToken() : null;
    });
    return () => registerRefreshHandler(null);
  }, [rotateTokens]);

  /**
   * Queue a refresh request. If one is already in flight, wait for it.
   * Calls onSuccess if tokens rotated, onFailure if refresh definitively failed.
   */
  const refreshQueue = useCallback((onSuccess: () => void, onFailure: () => void) => {
    refreshSubscribersRef.current.push({ onSuccess, onFailure });

    if (!refreshPromiseRef.current) {
      refreshPromiseRef.current = rotateTokens().then((success) => {
        const subscribers = refreshSubscribersRef.current;
        refreshSubscribersRef.current = [];
        refreshPromiseRef.current = null;

        subscribers.forEach(({ onSuccess, onFailure }) => {
          if (success) {
            onSuccess();
          } else {
            onFailure();
          }
        });

        return success;
      });
    }
  }, [rotateTokens]);

  // Listen for cross-tab rotation broadcasts
  useEffect(() => {
    if (!channel) return;
    const handler = (event: MessageEvent) => {
      if (event.data.type === "tokens_rotated") {
        setAccessToken(event.data.access_token);
      }
    };
    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        if (isMounted) setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const res = await apiClient.get<User>("/auth/me");
        const user = res.data;
        const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;
        if (isMounted) {
          setState({ user, tenant, token, isLoading: false, isAuthenticated: true });
        }
      } catch {
        // Access token expired on mount — try refresh
        let rotated = false;
        try {
          rotated = await rotateTokens();
        } catch {
          // A service outage is not an authentication failure. Retain tokens
          // and let the user retry rather than forcing a login screen.
          if (isMounted) setState((s) => ({ ...s, isLoading: false }));
          return;
        }
        if (!rotated && isMounted) {
          removeAuthTokens();
          setState((s) => ({
            ...s,
            user: null,
            tenant: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          }));
        }
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [rotateTokens]);

  // Keep-alive: rotate tokens every 10 minutes
  useEffect(() => {
    if (!state.isAuthenticated) return;
    const intervalId = setInterval(() => {
      rotateTokens().catch((error) => {
        console.warn("[Auth] Background token refresh failed; session retained.", error);
      });
    }, KEEP_ALIVE_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [state.isAuthenticated, rotateTokens]);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post<LoginResponse>("/auth/login", { email, password });
      const { access_token, refresh_token, user } = res.data;

      setTokens(access_token, refresh_token);
      const tenant = user.tenant_id ? await fetchTenant(user.tenant_id, true) : null;

      setState({
        user,
        tenant,
        token: access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      if (user.role === "super_admin") router.push("/super-admin");
      else router.push("/dashboard");
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    const refresh_token = getRefreshToken();
    removeAuthTokens();
    clearTenantCache();
    setState({
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    if (refresh_token) {
      apiClient.post("/auth/logout", { refresh_token }).catch(() => {});
    } else {
      apiClient.post("/auth/logout", {}).catch(() => {});
    }
    
    router.push("/login");
  };

  /**
   * ✅ Manual refresh (for UI buttons). Only logs out if refresh endpoint
   * definitively rejected (401/403), not on network errors.
   */
  const refresh = useCallback(async (): Promise<boolean> => {
    let ok = false;
    try {
      ok = await rotateTokens();
    } catch {
      // Transient backend/network failure; preserve local session state.
      return false;
    }
    if (!ok) {
      // Check if it was an auth failure (refresh token dead) vs network
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // No refresh token — definitely logged out
        removeAuthTokens();
        clearTenantCache();
        setState({
          user: null,
          tenant: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
      // If refresh token still exists but rotation failed, it's likely a
      // network blip — don't logout, let the next request retry
    }
    return ok;
  }, [rotateTokens]);

  const refreshTenant = useCallback(async () => {
    if (!state.user?.tenant_id) return;
    const tenant = await fetchTenant(state.user.tenant_id, true);
    if (tenant) {
      setState((s) => ({ ...s, tenant }));
    }
  }, [state.user?.tenant_id]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh, refreshTenant, refreshQueue }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
