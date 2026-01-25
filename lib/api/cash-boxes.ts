import { apiClient } from "./client";
import type {
  CashBox,
  CashBoxSummary,
  Transaction,
  OpenCashBoxRequestDto,
  CloseCashBoxRequestDto,
} from "./types";

export async function getTodayCashBox(date?: string): Promise<CashBox | null> {
  return apiClient<CashBox | null>("/api/CashBoxes/today", {
    params: date ? { date } : undefined,
  });
}

export async function getCashBoxesByRange(
  from?: string,
  to?: string
): Promise<CashBox[]> {
  return apiClient<CashBox[]>("/api/CashBoxes/range", {
    params: { from, to },
  });
}

export async function getCashBoxTransactions(id: string): Promise<Transaction[]> {
  return apiClient<Transaction[]>(`/api/CashBoxes/${id}/transactions`);
}

export async function getCashBoxSummary(id: string): Promise<CashBoxSummary> {
  return apiClient<CashBoxSummary>(`/api/CashBoxes/${id}/summary`);
}

export async function openCashBox(
  data: OpenCashBoxRequestDto
): Promise<CashBox> {
  return apiClient<CashBox>("/api/CashBoxes/open", {
    method: "POST",
    body: data,
  });
}

export async function closeCashBox(
  id: string,
  data: CloseCashBoxRequestDto
): Promise<CashBox> {
  return apiClient<CashBox>(`/api/CashBoxes/${id}/close`, {
    method: "POST",
    body: data,
  });
}

export async function reopenCashBox(id: string): Promise<CashBox> {
  return apiClient<CashBox>(`/api/CashBoxes/${id}/reopen`, {
    method: "POST",
  });
}
