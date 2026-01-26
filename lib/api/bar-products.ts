// lib/api/bar-products.ts
import { apiClient } from "./client";
import type { BarProduct, BarProductRequestDto } from "./types";

export async function getBarProducts(): Promise<BarProduct[]> {
  return (await apiClient<BarProduct[]>("/api/BarProducts")) ?? [];
}

export async function getBarProduct(id: string): Promise<BarProduct> {
  const res = await apiClient<BarProduct>(`/api/BarProducts/${id}`);
  if (!res) throw new Error("Producto no encontrado");
  return res;
}

export async function createBarProduct(data: BarProductRequestDto): Promise<BarProduct> {
  const res = await apiClient<BarProduct>("/api/BarProducts", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear producto");
  return res;
}

export async function updateBarProduct(id: string, data: BarProductRequestDto): Promise<BarProduct> {
  const res = await apiClient<BarProduct>(`/api/BarProducts/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar producto");
  return res;
}

export async function deleteBarProduct(id: string): Promise<void> {
  await apiClient<void>(`/api/BarProducts/${id}`, {
    method: "DELETE",
  });
}
