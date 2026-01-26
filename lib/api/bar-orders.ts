// lib/api/bar-orders.ts
import { apiClient } from "./client";
import type {
  BarOrder,
  BarOrderRequestDto,
  BarOrderDetail,
  BarOrderDetailCreateRequestDto,
  BarOrderDetailUpdateRequestDto,
} from "./types";

export async function getBarOrders(): Promise<BarOrder[]> {
  return (await apiClient<BarOrder[]>("/api/BarOrders")) ?? [];
}

export async function getBarOrder(id: string): Promise<BarOrder> {
  const res = await apiClient<BarOrder>(`/api/BarOrders/${id}`);
  if (!res) throw new Error("Orden no encontrada");
  return res;
}

export async function createBarOrder(data: BarOrderRequestDto): Promise<BarOrder> {
  const res = await apiClient<BarOrder>("/api/BarOrders", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear orden");
  return res;
}

export async function deleteBarOrder(id: string): Promise<void> {
  await apiClient<void>(`/api/BarOrders/${id}`, {
    method: "DELETE",
  });
}

// Details
export async function getBarOrderDetail(orderId: string, barProductId: string): Promise<BarOrderDetail> {
  const res = await apiClient<BarOrderDetail>(`/api/BarOrders/${orderId}/details/${barProductId}`);
  if (!res) throw new Error("Detalle no encontrado");
  return res;
}

export async function createBarOrderDetail(
  orderId: string,
  data: BarOrderDetailCreateRequestDto
): Promise<BarOrderDetail> {
  const res = await apiClient<BarOrderDetail>(`/api/BarOrders/${orderId}/details`, {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear detalle");
  return res;
}

export async function updateBarOrderDetail(
  orderId: string,
  barProductId: string,
  data: BarOrderDetailUpdateRequestDto
): Promise<BarOrderDetail> {
  const res = await apiClient<BarOrderDetail>(`/api/BarOrders/${orderId}/details/${barProductId}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar detalle");
  return res;
}

export async function deleteBarOrderDetail(orderId: string, barProductId: string): Promise<void> {
  await apiClient<void>(`/api/BarOrders/${orderId}/details/${barProductId}`, {
    method: "DELETE",
  });
}
