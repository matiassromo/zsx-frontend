// lib/api/keys.ts
import { apiClient } from "./client";
import type { Key, KeyRequestDto } from "./types";

export async function getKeys(): Promise<Key[]> {
  return (await apiClient<Key[]>("/api/Keys")) ?? [];
}

export async function getKey(id: string): Promise<Key> {
  const res = await apiClient<Key>(`/api/Keys/${id}`);
  if (!res) throw new Error("Llave no encontrada");
  return res;
}

export async function updateKey(id: string, data: KeyRequestDto): Promise<Key> {
  const res = await apiClient<Key>(`/api/Keys/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar llave");
  return res;
}
