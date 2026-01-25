import { apiClient } from "./client";
import type {
  CashBox,
  CashBoxSummary,
  Transaction,
  OpenCashBoxRequestDto,
  CloseCashBoxRequestDto,
} from "./types";

type AnyRecord = Record<string, unknown>;

function pick<T = unknown>(obj: AnyRecord | null | undefined, pascal: string, camel?: string): T {
  if (!obj) return undefined as T;
  if (obj[pascal] !== undefined) return obj[pascal] as T;
  if (camel && obj[camel] !== undefined) return obj[camel] as T;
  // fallback: intenta camel por defecto (Id -> id)
  const autoCamel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  if (obj[autoCamel] !== undefined) return obj[autoCamel] as T;
  return undefined as T;
}

function mapCashBoxStatus(v: unknown): "Open" | "Closed" {
  // soporta: 0/1, "Open"/"Closed", "open"/"closed"
  if (v === 0 || v === "Open" || v === "open") return "Open";
  if (v === 1 || v === "Closed" || v === "closed") return "Closed";
  return "Closed";
}

function mapCashBoxDtoToFront(raw: AnyRecord): CashBox {
  return {
    id: pick<string>(raw, "Id", "id"),
    status: mapCashBoxStatus(pick<unknown>(raw, "Status", "status")),
    openingBalance: pick<number>(raw, "OpeningBalance", "openingBalance"),
    closingBalance: pick<number | null>(raw, "ClosingBalance", "closingBalance") ?? null,
    openedAt: pick<string>(raw, "OpenedAt", "openedAt"),
    closedAt: pick<string | null>(raw, "ClosedAt", "closedAt") ?? null,
    notes: (pick<string | null>(raw, "Notes", "notes") ?? null),
  };
}

export async function getTodayCashBox(date?: string): Promise<CashBox | null> {
  const response = await apiClient<AnyRecord>("/api/CashBoxes/today", {
    params: date ? { date } : undefined,
  });

  if (!response) return null;
  return mapCashBoxDtoToFront(response);
}

export async function getCashBoxesByRange(from?: string, to?: string): Promise<CashBox[]> {
  const list = await apiClient<AnyRecord[]>("/api/CashBoxes/range", {
    params: { from, to },
  });

  if (!Array.isArray(list)) return [];
  return list.map(mapCashBoxDtoToFront);
}

export async function getCashBoxTransactions(id: string): Promise<Transaction[]> {
  return apiClient<Transaction[]>(`/api/CashBoxes/${id}/transactions`);
}

export async function getCashBoxSummary(id?: string): Promise<CashBoxSummary | null> {
  if (!id) return null;

  const response = await apiClient<AnyRecord>(`/api/CashBoxes/${id}/summary`);
  if (!response) return null;

  const cashBoxRaw = pick<AnyRecord>(response, "CashBox", "cashBox");
  if (!cashBoxRaw) return null;

  return {
    cashBox: mapCashBoxDtoToFront(cashBoxRaw),
    totalCharges: pick<number>(response, "TotalCharges", "totalCharges") ?? 0,
    totalPayments: pick<number>(response, "TotalPayments", "totalPayments") ?? 0,
    cash: pick<number>(response, "Cash", "cash") ?? 0,
    transfer: pick<number>(response, "Transfer", "transfer") ?? 0,
    openTransactions: pick<number>(response, "OpenTransactions", "openTransactions") ?? 0,
    closedTransactions: pick<number>(response, "ClosedTransactions", "closedTransactions") ?? 0,
  };
}

export async function openCashBox(data: OpenCashBoxRequestDto): Promise<CashBox> {
  const response = await apiClient<AnyRecord>("/api/CashBoxes/open", {
    method: "POST",
    body: data,
  });

  return mapCashBoxDtoToFront(response);
}

export async function closeCashBox(id: string, data: CloseCashBoxRequestDto): Promise<CashBox> {
  const response = await apiClient<AnyRecord>(`/api/CashBoxes/${id}/close`, {
    method: "POST",
    body: data,
  });

  return mapCashBoxDtoToFront(response);
}

export async function reopenCashBox(id: string): Promise<CashBox> {
  const response = await apiClient<AnyRecord>(`/api/CashBoxes/${id}/reopen`, {
    method: "POST",
  });

  return mapCashBoxDtoToFront(response);
}
