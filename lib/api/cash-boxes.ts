import { apiClient } from "./client";
import type {
  CashBox,
  CashBoxSummary,
  Transaction,
  OpenCashBoxRequestDto,
  CloseCashBoxRequestDto,
} from "./types";

type AnyRecord = Record<string, unknown>;

function pick<T = unknown>(
  obj: AnyRecord | null | undefined,
  pascal: string,
  camel?: string
): T {
  if (!obj) return undefined as T;
  if (obj[pascal] !== undefined) return obj[pascal] as T;
  if (camel && obj[camel] !== undefined) return obj[camel] as T;
  const autoCamel = pascal.charAt(0).toLowerCase() + pascal.slice(1);
  if (obj[autoCamel] !== undefined) return obj[autoCamel] as T;
  return undefined as T;
}

function mapCashBoxStatus(v: unknown): "Open" | "Closed" {
  if (v === 0 || v === "Open" || v === "open") return "Open";
  if (v === 1 || v === "Closed" || v === "closed") return "Closed";
  return "Closed";
}

function mapCashBoxDtoToFront(raw: AnyRecord): CashBox {
  return {
    id: pick<string>(raw, "Id", "id"),
    status: mapCashBoxStatus(pick<unknown>(raw, "Status", "status")),
    openingBalance: pick<number>(raw, "OpeningBalance", "openingBalance"),
    closingBalance: (pick<number | null>(raw, "ClosingBalance", "closingBalance") ?? null),
    openedAt: pick<string>(raw, "OpenedAt", "openedAt"),
    closedAt: (pick<string | null>(raw, "ClosedAt", "closedAt") ?? null),
    notes: (pick<string | null>(raw, "Notes", "notes") ?? null),
  };
}

function fmtYMDLocal(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtYMDUtc(d: Date) {
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function fetchTodayRaw(date?: string): Promise<CashBox | null> {
  const response = await apiClient<AnyRecord>("/api/CashBoxes/today", {
    params: date ? { date } : undefined,
  });
  if (!response) return null;
  return mapCashBoxDtoToFront(response);
}

/**
 * ✅ FIX: tolerante a desfase UTC/local.
 * - primero intenta /today sin date
 * - si no hay, intenta con fecha local, UTC y ±1 día
 */
export async function getTodayCashBox(date?: string): Promise<CashBox | null> {
  if (date) return await fetchTodayRaw(date);

  const first = await fetchTodayRaw();
  if (first) return first;

  const now = new Date();
  const candidates = [
    fmtYMDLocal(now),
    fmtYMDUtc(now),
    fmtYMDLocal(addDays(now, -1)),
    fmtYMDUtc(addDays(now, -1)),
    fmtYMDLocal(addDays(now, +1)),
    fmtYMDUtc(addDays(now, +1)),
  ];

  for (const d of candidates) {
    const cb = await fetchTodayRaw(d);
    if (cb) return cb;
  }

  return null;
}

export async function getCashBoxById(id: string): Promise<CashBox | null> {
  const response = await apiClient<AnyRecord>(`/api/CashBoxes/${id}`);
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
  return (await apiClient<Transaction[]>(`/api/CashBoxes/${id}/transactions`)) ?? [];
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
  const response = (await apiClient<AnyRecord>("/api/CashBoxes/open", {
    method: "POST",
    body: data,
  }))!;
  return mapCashBoxDtoToFront(response);
}

export async function closeCashBox(id: string, data: CloseCashBoxRequestDto): Promise<CashBox> {
  const response = (await apiClient<AnyRecord>(`/api/CashBoxes/${id}/close`, {
    method: "POST",
    body: data,
  }))!;
  return mapCashBoxDtoToFront(response);
}

export async function reopenCashBox(id: string): Promise<CashBox> {
  const response = (await apiClient<AnyRecord>(`/api/CashBoxes/${id}/reopen`, {
    method: "POST",
  }))!;
  return mapCashBoxDtoToFront(response);
}
