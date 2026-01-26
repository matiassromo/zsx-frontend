// lib/api/parkings.ts
import { apiClient } from "./client";
import type { Parking, ParkingRequestDto } from "./types";

export async function getParkings(): Promise<Parking[]> {
  return (await apiClient<Parking[]>("/api/Parkings")) ?? [];
}

export async function getParking(id: string): Promise<Parking> {
  const res = await apiClient<Parking>(`/api/Parkings/${id}`);
  if (!res) throw new Error("Parqueo no encontrado");
  return res;
}

export async function createParking(data: ParkingRequestDto): Promise<Parking> {
  const res = await apiClient<Parking>("/api/Parkings", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear parqueo");
  return res;
}

export async function updateParking(id: string, data: ParkingRequestDto): Promise<Parking> {
  const res = await apiClient<Parking>(`/api/Parkings/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar parqueo");
  return res;
}

export async function deleteParking(id: string): Promise<void> {
  await apiClient<void>(`/api/Parkings/${id}`, {
    method: "DELETE",
  });
}
