import { apiClient } from "./client";
import type {
  BarOrder,
  BarOrderRequestDto,
  BarOrderDetail,
  BarOrderDetailCreateRequestDto,
  BarOrderDetailUpdateRequestDto,
} from "./types";

export async function getBarOrders(): Promise<BarOrder[]> {
  return apiClient<BarOrder[]>("/api/BarOrders");
}

export async function getBarOrder(id: string): Promise<BarOrder> {
  return apiClient<BarOrder>(`/api/BarOrders/${id}`);
}

export async function createBarOrder(
  data: BarOrderRequestDto
): Promise<BarOrder> {
  return apiClient<BarOrder>("/api/BarOrders", {
    method: "POST",
    body: data,
  });
}

export async function deleteBarOrder(id: string): Promise<void> {
  return apiClient<void>(`/api/BarOrders/${id}`, {
    method: "DELETE",
  });
}

// Bar Order Details
export async function getBarOrderDetail(
  orderId: string,
  barProductId: string
): Promise<BarOrderDetail> {
  return apiClient<BarOrderDetail>(
    `/api/BarOrders/${orderId}/details/${barProductId}`
  );
}

export async function createBarOrderDetail(
  orderId: string,
  data: BarOrderDetailCreateRequestDto
): Promise<BarOrderDetail> {
  return apiClient<BarOrderDetail>(`/api/BarOrders/${orderId}/details`, {
    method: "POST",
    body: data,
  });
}

export async function updateBarOrderDetail(
  orderId: string,
  barProductId: string,
  data: BarOrderDetailUpdateRequestDto
): Promise<BarOrderDetail> {
  return apiClient<BarOrderDetail>(
    `/api/BarOrders/${orderId}/details/${barProductId}`,
    {
      method: "PUT",
      body: data,
    }
  );
}

export async function deleteBarOrderDetail(
  orderId: string,
  barProductId: string
): Promise<void> {
  return apiClient<void>(`/api/BarOrders/${orderId}/details/${barProductId}`, {
    method: "DELETE",
  });
}
