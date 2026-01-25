import { apiClient } from "./client";
import type { EntranceTransaction, EntranceTransactionRequestDto } from "./types";

export async function getEntranceTransactions(): Promise<EntranceTransaction[]> {
  return apiClient<EntranceTransaction[]>("/api/EntranceTransactions");
}

export async function getEntranceTransaction(
  id: string
): Promise<EntranceTransaction> {
  return apiClient<EntranceTransaction>(`/api/EntranceTransactions/${id}`);
}

export async function createEntranceTransaction(
  data: EntranceTransactionRequestDto
): Promise<EntranceTransaction> {
  return apiClient<EntranceTransaction>("/api/EntranceTransactions", {
    method: "POST",
    body: data,
  });
}

export async function updateEntranceTransaction(
  id: string,
  data: EntranceTransactionRequestDto
): Promise<EntranceTransaction> {
  return apiClient<EntranceTransaction>(`/api/EntranceTransactions/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteEntranceTransaction(id: string): Promise<void> {
  return apiClient<void>(`/api/EntranceTransactions/${id}`, {
    method: "DELETE",
  });
}
