import { apiClient } from "./client";
import type { Payment, PaymentRequestDto } from "./types";

export async function getPayments(): Promise<Payment[]> {
  return apiClient<Payment[]>("/api/Payments");
}

export async function getPayment(id: string): Promise<Payment> {
  return apiClient<Payment>(`/api/Payments/${id}`);
}

export async function createPayment(data: PaymentRequestDto): Promise<Payment> {
  return apiClient<Payment>("/api/Payments", {
    method: "POST",
    body: data,
  });
}

export async function updatePayment(
  id: string,
  data: PaymentRequestDto
): Promise<Payment> {
  return apiClient<Payment>(`/api/Payments/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deletePayment(id: string): Promise<void> {
  return apiClient<void>(`/api/Payments/${id}`, {
    method: "DELETE",
  });
}
