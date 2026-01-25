import { apiClient } from "./client";
import type { EntranceAccessCard, EntranceAccessCardRequestDto } from "./types";

export async function getEntranceAccessCards(): Promise<EntranceAccessCard[]> {
  return apiClient<EntranceAccessCard[]>("/api/EntranceAccessCards");
}

export async function getEntranceAccessCard(
  id: string
): Promise<EntranceAccessCard> {
  return apiClient<EntranceAccessCard>(`/api/EntranceAccessCards/${id}`);
}

export async function createEntranceAccessCard(
  data: EntranceAccessCardRequestDto
): Promise<EntranceAccessCard> {
  return apiClient<EntranceAccessCard>("/api/EntranceAccessCards", {
    method: "POST",
    body: data,
  });
}

export async function updateEntranceAccessCard(
  id: string,
  data: EntranceAccessCardRequestDto
): Promise<EntranceAccessCard> {
  return apiClient<EntranceAccessCard>(`/api/EntranceAccessCards/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteEntranceAccessCard(id: string): Promise<void> {
  return apiClient<void>(`/api/EntranceAccessCards/${id}`, {
    method: "DELETE",
  });
}
