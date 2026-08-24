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
import apiClient from "@/lib/api-client";
import { AuthState, User, Tenant, LoginResponse } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
  refreshTenant: () => Promise<void>;
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
  
  // Store in localStorage (for API interceptor)
  localStorage.setItem(ACCESS_KEY, accessToken);
  
  // Store in cookie (for middleware edge validation)
  const isSecure = window.location.protocol === "https:";
  const expires = new Date(Date.now() + 15 * 60 * 1000).toUTCString(); // 15 min
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
  
  // Clear localStorage
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  
  // Clear cookies
  document.cookie = `${ACCESS_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = "rm_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
};

// ─── TENANT CACHE ──────────────────────────────────────────────────────────
let cachedTenant: Tenant | null = null;
let tenantCacheTimestamp = 0;
const TENANT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
  const isRotatingRef = useRef(false);

  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * Silent token rotation via POST /auth/refresh.
   * Sends the refresh token in the request body (localStorage-backed),
   * since cross-site HttpOnly cookies are blocked by modern browsers.
   */
  const rotateTokens = useCallback(async (): Promise<boolean> => {
    if (isRotatingRef.current) return false;
    isRotatingRef.current = true;

    try {
      const refresh_token = getRefreshToken();
      if (!refresh_token) return false;

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
    } catch {
      return false;
    } finally {
      isRotatingRef.current = false;
    }
  }, []);

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
        const rotated = await rotateTokens();
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
      rotateTokens();
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

  const refresh = useCallback(async () => {
    const ok = await rotateTokens();
    if (!ok) {
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
  }, [rotateTokens]);

  const refreshTenant = useCallback(async () => {
    if (!state.user?.tenant_id) return;
    const tenant = await fetchTenant(state.user.tenant_id, true);
    if (tenant) {
      setState((s) => ({ ...s, tenant }));
    }
  }, [state.user?.tenant_id]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh, refreshTenant }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
