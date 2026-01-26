import { apiClient } from "./client";
import type { Client, ClientRequestDto } from "./types";

export async function getClients(): Promise<Client[]> {
  return (await apiClient<Client[]>("/api/Clients")) ?? [];
}

export async function getClient(id: string): Promise<Client> {
  // si no existe, apiClient en GET 404 devuelve undefined -> aquí lo convertimos a error claro
  const res = await apiClient<Client>(`/api/Clients/${id}`);
  if (!res) throw new Error("Cliente no encontrado");
  return res;
}

export async function createClient(data: ClientRequestDto): Promise<Client> {
  const res = await apiClient<Client>("/api/Clients", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear cliente");
  return res;
}

export async function updateClient(id: string, data: ClientRequestDto): Promise<Client> {
  const res = await apiClient<Client>(`/api/Clients/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar cliente");
  return res;
}

export async function deleteClient(id: string): Promise<void> {
  await apiClient<void>(`/api/Clients/${id}`, {
    method: "DELETE",
  });
}
