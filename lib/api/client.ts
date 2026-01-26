import { emitZsEvent } from "@/lib/events";
import {
  getStoredTokens,
  clearAuth,
  getStoredUser,
  isTokenExpired,
  storeAuth,
} from "@/lib/auth/storage";
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

  if (!tokens || !storedUser) return null;

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
): Promise<T | undefined> {
  const { method = "GET", body, params } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value);
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  const headers: HeadersInit = { "Content-Type": "application/json" };

  const token = await getValidToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };
  if (body !== undefined) config.body = JSON.stringify(body);

  console.log("[apiClient]", method, url);


  const response = await fetch(url, config);

  // 401: limpiar auth y avisar
if (!response.ok) {
  const raw = await response.text().catch(() => "");
  let msg = raw;

  // intenta extraer message del típico ProblemDetails / {message:""}
  try {
    const j = JSON.parse(raw);
    msg =
      j?.message ||
      j?.title ||
      j?.error ||
      (typeof j === "string" ? j : raw);
  } catch {
    // raw ya es texto
  }

  throw new ApiError(response.status, response.statusText, msg);
}

  // ✅ Lecturas: 404 = "no existe" (ej: CashBoxes/today sin caja)
  if (method === "GET" && response.status === 404) {
    return undefined;
  }

  // ✅ 204 NoContent = "no hay data"
  if (response.status === 204) {
    return undefined;
  }

  // Otros errores reales
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new ApiError(response.status, response.statusText, errorText);
  }

  // ✅ Mutaciones: notificar
  if (method !== "GET") {
    emitZsEvent({
      type: "api:mutated",
      path: endpoint,
      method,
      at: Date.now(),
    });
  }

  // ✅ Respuesta vacía (a veces content-length no viene o viene mal)
  const text = await response.text();
  if (!text) return undefined;

  return JSON.parse(text) as T;
}
