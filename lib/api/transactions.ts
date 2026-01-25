import { apiClient } from "./client";
import type { Transaction, TransactionRequestDto } from "./types";

export async function getTransactions(cashBoxId?: string): Promise<Transaction[]> {
  return apiClient<Transaction[]>("/api/Transactions", {
    params: cashBoxId ? { cashBoxId } : undefined,
  });
}

export async function getTransaction(id: string): Promise<Transaction> {
  return apiClient<Transaction>(`/api/Transactions/${id}`);
}

export async function createTransaction(
  data: TransactionRequestDto
): Promise<Transaction> {
  return apiClient<Transaction>("/api/Transactions", {
    method: "POST",
    body: data,
  });
}

export async function updateTransaction(
  id: string,
  data: TransactionRequestDto
): Promise<Transaction> {
  return apiClient<Transaction>(`/api/Transactions/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function closeTransaction(id: string): Promise<Transaction> {
  return apiClient<Transaction>(`/api/Transactions/${id}/close`, {
    method: "POST",
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiClient<void>(`/api/Transactions/${id}`, {
    method: "DELETE",
  });
}
