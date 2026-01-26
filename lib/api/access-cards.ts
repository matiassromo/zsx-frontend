// lib/api/access-cards.ts
import { apiClient } from "./client";
import type { AccessCard, AccessCardRequestDto } from "./types";

export async function getAccessCards(): Promise<AccessCard[]> {
  return (await apiClient<AccessCard[]>("/api/AccessCards")) ?? [];
}

export async function getAccessCard(id: string): Promise<AccessCard> {
  const res = await apiClient<AccessCard>(`/api/AccessCards/${id}`);
  if (!res) throw new Error("Tarjeta no encontrada");
  return res;
}

export async function createAccessCard(data: AccessCardRequestDto): Promise<AccessCard> {
  const res = await apiClient<AccessCard>("/api/AccessCards", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear tarjeta");
  return res;
}

export async function updateAccessCard(id: string, data: AccessCardRequestDto): Promise<AccessCard> {
  const res = await apiClient<AccessCard>(`/api/AccessCards/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar tarjeta");
  return res;
}

export async function deleteAccessCard(id: string): Promise<void> {
  await apiClient<void>(`/api/AccessCards/${id}`, {
    method: "DELETE",
  });
}
