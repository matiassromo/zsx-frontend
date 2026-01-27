// lib/api/payments.ts
import { apiClient } from "./client";
import type { Payment, PaymentRequestDto } from "./types";

export async function getPayments(): Promise<Payment[]> {
  return (await apiClient<Payment[]>("/api/Payments")) ?? [];
}

export async function getPayment(id: string): Promise<Payment> {
  const res = await apiClient<Payment>(`/api/Payments/${id}`);
  if (!res) throw new Error("Pago no encontrado");
  return res;
}

export async function createPayment(data: PaymentRequestDto): Promise<Payment> {
  const res = await apiClient<Payment>("/api/Payments", {
    method: "POST",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al crear pago");

  // ✅ AQUÍ
  new BroadcastChannel("zs-events").postMessage({ type: "payment:created" });

  return res;
}


export async function updatePayment(id: string, data: PaymentRequestDto): Promise<Payment> {
  const res = await apiClient<Payment>(`/api/Payments/${id}`, {
    method: "PUT",
    body: data,
  });
  if (!res) throw new Error("Respuesta vacía al actualizar pago");
  new BroadcastChannel("zs-events").postMessage({ type: "payment:updated" });
  return res;
}

export async function deletePayment(id: string): Promise<void> {
  await apiClient<void>(`/api/Payments/${id}`, {
    method: "DELETE",
  });
}
