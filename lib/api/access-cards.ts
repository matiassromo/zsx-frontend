import { apiClient } from "./client";
import type { AccessCard, AccessCardRequestDto } from "./types";

export async function getAccessCards(): Promise<AccessCard[]> {
  return apiClient<AccessCard[]>("/api/AccessCards");
}

export async function getAccessCard(id: string): Promise<AccessCard> {
  return apiClient<AccessCard>(`/api/AccessCards/${id}`);
}

export async function createAccessCard(
  data: AccessCardRequestDto
): Promise<AccessCard> {
  return apiClient<AccessCard>("/api/AccessCards", {
    method: "POST",
    body: data,
  });
}

export async function updateAccessCard(
  id: string,
  data: AccessCardRequestDto
): Promise<AccessCard> {
  return apiClient<AccessCard>(`/api/AccessCards/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteAccessCard(id: string): Promise<void> {
  return apiClient<void>(`/api/AccessCards/${id}`, {
    method: "DELETE",
  });
}
