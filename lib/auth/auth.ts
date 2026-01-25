// Auth API functions - uses raw fetch to avoid circular dependencies with apiClient

import type {
  LoginRequestDto,
  RefreshTokenRequestDto,
  AuthResponse,
} from "@/lib/api/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5058";

export class AuthError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `${status} ${statusText}`);
    this.name = "AuthError";
  }
}

export async function login(
  credentials: LoginRequestDto
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new AuthError(response.status, response.statusText, errorText);
  }

  return response.json();
}

export async function refreshToken(
  data: RefreshTokenRequestDto
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new AuthError(response.status, response.statusText, errorText);
  }

  return response.json();
}

export async function revokeToken(
  data: RefreshTokenRequestDto
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/revoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new AuthError(response.status, response.statusText, errorText);
  }
}
