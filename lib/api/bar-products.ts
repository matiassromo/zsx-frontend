import { apiClient } from "./client";
import type { BarProduct, BarProductRequestDto } from "./types";

export async function getBarProducts(): Promise<BarProduct[]> {
  return apiClient<BarProduct[]>("/api/BarProducts");
}

export async function getBarProduct(id: string): Promise<BarProduct> {
  return apiClient<BarProduct>(`/api/BarProducts/${id}`);
}

export async function createBarProduct(
  data: BarProductRequestDto
): Promise<BarProduct> {
  return apiClient<BarProduct>("/api/BarProducts", {
    method: "POST",
    body: data,
  });
}

export async function updateBarProduct(
  id: string,
  data: BarProductRequestDto
): Promise<BarProduct> {
  return apiClient<BarProduct>(`/api/BarProducts/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteBarProduct(id: string): Promise<void> {
  return apiClient<void>(`/api/BarProducts/${id}`, {
    method: "DELETE",
  });
}
