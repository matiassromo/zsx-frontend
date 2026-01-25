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

interface CashBoxResponse {
  Id: string;
  Status: 'Open' | 'Closed';
  OpeningBalance: number;
  ClosingBalance?: number | null;
  OpenedAt: string;
  ClosedAt?: string | null;
  Notes?: string | null;
}

interface CashBoxSummaryResponse {
  CashBox: CashBoxResponse;
  TotalCharges: number;
  TotalPayments: number;
  Cash: number;
  Transfer: number;
  OpenTransactions: number;
  ClosedTransactions: number;
}

export async function getCashBoxSummary(id: string): Promise<CashBoxSummary> {
  const response = await apiClient<CashBoxSummaryResponse>(`/api/CashBoxes/${id}/summary`);
  return {
    cashBox: {
      id: response.CashBox.Id,
      status: response.CashBox.Status,
      openingBalance: response.CashBox.OpeningBalance,
      closingBalance: response.CashBox.ClosingBalance,
      openedAt: response.CashBox.OpenedAt,
      closedAt: response.CashBox.ClosedAt,
      notes: response.CashBox.Notes,
    },
    totalCharges: response.TotalCharges,
    totalPayments: response.TotalPayments,
    cash: response.Cash,
    transfer: response.Transfer,
    openTransactions: response.OpenTransactions,
    closedTransactions: response.ClosedTransactions,
  };
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
