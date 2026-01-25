import { apiClient } from "./client";
import type { Parking, ParkingRequestDto } from "./types";

export async function getParkings(): Promise<Parking[]> {
  return apiClient<Parking[]>("/api/Parkings");
}

export async function getParking(id: string): Promise<Parking> {
  return apiClient<Parking>(`/api/Parkings/${id}`);
}

export async function createParking(data: ParkingRequestDto): Promise<Parking> {
  return apiClient<Parking>("/api/Parkings", {
    method: "POST",
    body: data,
  });
}

export async function updateParking(
  id: string,
  data: ParkingRequestDto
): Promise<Parking> {
  return apiClient<Parking>(`/api/Parkings/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteParking(id: string): Promise<void> {
  return apiClient<void>(`/api/Parkings/${id}`, {
    method: "DELETE",
  });
}
