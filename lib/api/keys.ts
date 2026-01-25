import { apiClient } from "./client";
import type { Key, KeyRequestDto } from "./types";

export async function getKeys(): Promise<Key[]> {
  return apiClient<Key[]>("/api/Keys");
}

export async function getKey(id: string): Promise<Key> {
  return apiClient<Key>(`/api/Keys/${id}`);
}

export async function updateKey(id: string, data: KeyRequestDto): Promise<Key> {
  return apiClient<Key>(`/api/Keys/${id}`, {
    method: "PUT",
    body: data,
  });
}
