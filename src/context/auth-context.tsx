// src/context/auth-context.tsx
"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import { AuthState, User, Tenant, LoginResponse } from "@/lib/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ✅ Store in BOTH cookie (for middleware) and localStorage (for api-client)
const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("rm_token", token);
    const isSecure = window.location.protocol === "https:";
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
    document.cookie = `rm_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
  }
};

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("rm_token");
  }
  return null;
};

const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("rm_token");
    document.cookie = "rm_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }
};

// ✅ Fixed: Use /tenants/ not /admin/tenants/
async function fetchTenant(tenantId: number): Promise<Tenant | null> {
  try {
    const res = await apiClient.get<Tenant>(`/tenants/${tenantId}`);
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    apiClient
      .get<User>("/auth/me")
      .then(async (res) => {
        const user = res.data;
        const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;
        setState({ user, tenant, token, isLoading: false, isAuthenticated: true });
      })
      .catch(() => {
        removeAuthToken();
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    const { access_token, user } = res.data;

    // ✅ Store in both places
    setAuthToken(access_token);

    const tenant = user.tenant_id ? await fetchTenant(user.tenant_id) : null;

    setState({
      user,
      tenant,
      token: access_token,
      isLoading: false,
      isAuthenticated: true,
    });

    if (user.role === "super_admin") router.push("/super-admin");
    else router.push("/dashboard");
  };

  const logout = () => {
    removeAuthToken();
    setState({
      user: null,
      tenant: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
