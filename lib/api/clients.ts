import { apiClient } from "./client";
import type { Client, ClientRequestDto } from "./types";

export async function getClients(): Promise<Client[]> {
  return apiClient<Client[]>("/api/Clients");
}

export async function getClient(id: string): Promise<Client> {
  return apiClient<Client>(`/api/Clients/${id}`);
}

export async function createClient(data: ClientRequestDto): Promise<Client> {
  return apiClient<Client>("/api/Clients", {
    method: "POST",
    body: data,
  });
}

export async function updateClient(
  id: string,
  data: ClientRequestDto
): Promise<Client> {
  return apiClient<Client>(`/api/Clients/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteClient(id: string): Promise<void> {
  return apiClient<void>(`/api/Clients/${id}`, {
    method: "DELETE",
  });
}
