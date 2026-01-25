import { emitZsEvent } from "@/lib/events";
import { getStoredTokens, clearAuth, getStoredUser, isTokenExpired, storeAuth } from "@/lib/auth/storage";
import { refreshToken as apiRefreshToken } from "@/lib/auth/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5058";

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `${status} ${statusText}`);
    this.name = "ApiError";
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  params?: Record<string, string | undefined>;
};

async function getValidToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  const storedUser = getStoredUser();

  if (!tokens || !storedUser) {
    return null;
  }

  // Check if token is expired and refresh if needed
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

      return response.token;
    } catch {
      // Refresh failed
      clearAuth();
      emitZsEvent({ type: "auth:unauthorized", at: Date.now() });
      return null;
    }
  }

  return tokens.token;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, params } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth header if token exists
  const token = await getValidToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  // Handle 401 Unauthorized - clear auth and emit event
  if (response.status === 401) {
    clearAuth();
    emitZsEvent({ type: "auth:unauthorized", at: Date.now() });
    throw new ApiError(response.status, response.statusText, "Unauthorized");
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new ApiError(response.status, response.statusText, errorText);
  }

  // ✅ Si fue mutación, notifica a toda la app (Dashboard, Caja, Lockers, etc.)
  if (method !== "GET") {
    emitZsEvent({
      type: "api:mutated",
      path: endpoint,
      method,
      at: Date.now(),
    });
  }

  if (response.status === 204 || response.headers.get("content-length") === "0") {
    return undefined as T;
  }

  return response.json();
}
