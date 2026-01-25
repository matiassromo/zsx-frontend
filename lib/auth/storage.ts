// Token storage utilities for client-side auth

const TOKEN_KEY = "zs_token";
const REFRESH_TOKEN_KEY = "zs_refresh_token";
const USER_KEY = "zs_user";

export interface StoredUser {
  username: string;
  roles: string[];
  expiresAt: string;
}

export interface StoredTokens {
  token: string;
  refreshToken: string;
}

export function getStoredTokens(): StoredTokens | null {
  if (typeof window === "undefined") return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!token || !refreshToken) return null;

  return { token, refreshToken };
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;

  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as StoredUser;
  } catch {
    return null;
  }
}

export function storeAuth(
  token: string,
  refreshToken: string,
  user: StoredUser
): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isTokenExpired(expiresAt: string | Date): boolean {
  const expiry = typeof expiresAt === "string" ? new Date(expiresAt) : expiresAt;
  // Add 30 second buffer to account for network latency
  return expiry.getTime() - 30000 < Date.now();
}
