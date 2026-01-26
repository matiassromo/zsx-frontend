// lib/api/transactions.ts
import { apiClient } from "./client";
import type { Transaction, TransactionRequestDto, TransactionDetail } from "./types";

export async function getTransactions(cashBoxId?: string): Promise<Transaction[]> {
  return (await apiClient<Transaction[]>("/api/Transactions", {
    params: cashBoxId ? { cashBoxId } : undefined,
  })) ?? [];
}

export async function getTransaction(id: string): Promise<Transaction> {
  return (await apiClient<Transaction>(`/api/Transactions/${id}`))!;
}

export async function createTransaction(data: TransactionRequestDto): Promise<Transaction> {
  return (await apiClient<Transaction>("/api/Transactions", {
    method: "POST",
    body: data,
  }))!;
}

export async function updateTransaction(id: string, data: TransactionRequestDto): Promise<Transaction> {
  return (await apiClient<Transaction>(`/api/Transactions/${id}`, {
    method: "PUT",
    body: data,
  }))!;
}

export async function closeTransaction(id: string): Promise<Transaction> {
  return (await apiClient<Transaction>(`/api/Transactions/${id}/close`, {
    method: "POST",
  }))!;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient<void>(`/api/Transactions/${id}`, {
    method: "DELETE",
  });
}

export async function getTransactionDetail(id: string): Promise<TransactionDetail> {
  return (await apiClient<TransactionDetail>(`/api/Transactions/${id}/detail`))!;
}
