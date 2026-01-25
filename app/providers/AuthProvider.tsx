"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { LoginRequestDto, AuthUser } from "@/lib/api/types";
import {
  login as apiLogin,
  refreshToken as apiRefreshToken,
  revokeToken as apiRevokeToken,
} from "@/lib/auth/auth";
import {
  getStoredTokens,
  getStoredUser,
  storeAuth,
  clearAuth,
  isTokenExpired,
} from "@/lib/auth/storage";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  login: (credentials: LoginRequestDto) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Load auth state from localStorage on mount
  // This is a valid use case for setState in effect - loading initial state from storage
  useEffect(() => {
    const storedUser = getStoredUser();
    const tokens = getStoredTokens();

    if (storedUser && tokens) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser({
        username: storedUser.username,
        roles: storedUser.roles,
        expiresAt: new Date(storedUser.expiresAt),
      });
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequestDto): Promise<void> => {
      const response = await apiLogin(credentials);

      const authUser: AuthUser = {
        username: response.username,
        roles: response.roles,
        expiresAt: new Date(response.expiresAt),
      };

      storeAuth(response.token, response.refreshToken, {
        username: response.username,
        roles: response.roles,
        expiresAt: response.expiresAt,
      });

      setUser(authUser);
      setIsAuthenticated(true);
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    const tokens = getStoredTokens();

    if (tokens) {
      try {
        await apiRevokeToken({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        });
      } catch {
        // Ignore revocation errors - we're logging out anyway
      }
    }

    clearAuth();
    setUser(null);
    setIsAuthenticated(false);
    router.push("/login");
  }, [router]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const tokens = getStoredTokens();
    const storedUser = getStoredUser();

    if (!tokens || !storedUser) {
      return null;
    }

    // Check if token is expired
    if (isTokenExpired(storedUser.expiresAt)) {
      try {
        const response = await apiRefreshToken({
          token: tokens.token,
          refreshToken: tokens.refreshToken,
        });

        storeAuth(response.token, response.refreshToken, {
          username: response.username,
          roles: response.roles,
          expiresAt: response.expiresAt,
        });

        setUser({
          username: response.username,
          roles: response.roles,
          expiresAt: new Date(response.expiresAt),
        });

        return response.token;
      } catch {
        // Refresh failed - clear auth and return null
        clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    }

    return tokens.token;
  }, []);

  // Listen for unauthorized events from API client
  useEffect(() => {
    const channel = new BroadcastChannel("zs-events");

    channel.onmessage = (event) => {
      if (event.data?.type === "auth:unauthorized") {
        clearAuth();
        setUser(null);
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    return () => {
      channel.close();
    };
  }, [router]);

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
