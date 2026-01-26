// lib/api/entrance-access-cards.ts
import { apiClient } from "./client";
import type { EntranceAccessCard, EntranceAccessCardRequestDto } from "./types";

export async function getEntranceAccessCards(): Promise<EntranceAccessCard[]> {
  return (await apiClient<EntranceAccessCard[]>("/api/EntranceAccessCards")) ?? [];
}

export async function getEntranceAccessCard(id: string): Promise<EntranceAccessCard> {
  const res = await apiClient<EntranceAccessCard>(`/api/EntranceAccessCards/${id}`);
  if (!res) throw new Error("Registro no encontrado");
  return res;
}

export async function createEntranceAccessCard(
  data: EntranceAccessCardRequestDto
): Promise<EntranceAccessCard> {
  const res = await apiClient<EntranceAccessCard>("/api/EntranceAccessCards", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear");
  return res;
}

export async function updateEntranceAccessCard(
  id: string,
  data: EntranceAccessCardRequestDto
): Promise<EntranceAccessCard> {
  const res = await apiClient<EntranceAccessCard>(`/api/EntranceAccessCards/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar");
  return res;
}

export async function deleteEntranceAccessCard(id: string): Promise<void> {
  await apiClient<void>(`/api/EntranceAccessCards/${id}`, {
    method: "DELETE",
  });
}
