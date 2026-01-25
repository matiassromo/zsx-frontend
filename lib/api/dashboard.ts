// src/lib/api/dashboard.ts
import { getKeys } from "@/lib/api/keys";
import { getTransactions } from "@/lib/api/transactions";

type KeyLike = { status?: string; gender?: string; isAvailable?: boolean };
type TxLike = { type?: string; amount?: number; createdAt?: string; date?: string; kind?: string; category?: string };

function isToday(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function toDateMaybe(x?: string) {
  if (!x) return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
}

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (Array.isArray(x?.items)) return x.items as T[];
  if (Array.isArray(x?.data)) return x.data as T[];
  if (Array.isArray(x?.result)) return x.result as T[];
  return [];
}

export type DashboardSnapshot = {
  meta: { generatedAt: string; generatedAtLocal: string };
  keys: {
    total: number;
    available: number;
    availableMen: number;
    availableWomen: number;
    busy: number;
  };
  people: { today: number };
  money: {
    incomeToday: number;
    expenseToday: number;
    netToday: number;
    txCountToday: number;
  };
  pos: { openAccounts: number };
  bar: { salesToday: number };
  parking: { countToday: number };
  passes: { entriesToday: number };
};

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  const [keysRes, txRes] = await Promise.all([
    getKeys().catch(() => []),
    getTransactions().catch(() => []),
  ]);

  const keys = asArray<KeyLike>(keysRes);
  const txs = asArray<TxLike>(txRes);

  const totalKeys = keys.length || 32;

  const availableKeys = keys.length
    ? keys.filter(k =>
        k.isAvailable === true ||
        k.status?.toLowerCase() === "available" ||
        k.status?.toLowerCase() === "libre"
      ).length
    : 0;

  const availableMen = keys.filter(k =>
    (k.isAvailable === true || k.status?.toLowerCase() === "available" || k.status?.toLowerCase() === "libre") &&
    (k.gender?.toLowerCase() === "men" || k.gender?.toLowerCase() === "hombre" || k.gender?.toLowerCase() === "male")
  ).length;

  const availableWomen = keys.filter(k =>
    (k.isAvailable === true || k.status?.toLowerCase() === "available" || k.status?.toLowerCase() === "libre") &&
    (k.gender?.toLowerCase() === "women" || k.gender?.toLowerCase() === "mujer" || k.gender?.toLowerCase() === "female")
  ).length;

  const busy = keys.length ? Math.max(0, keys.length - availableKeys) : 0;

  const txToday = txs.filter(t => {
    const d = toDateMaybe(t.createdAt || t.date);
    return d ? isToday(d) : true;
  });

  const incomeToday = txToday
    .filter(t =>
      (t.type || t.kind || "").toLowerCase().includes("income") ||
      (t.type || "").toLowerCase().includes("pago") ||
      (t.category || "").toLowerCase().includes("ingreso")
    )
    .reduce((a, t) => a + (t.amount ?? 0), 0);

  const expenseToday = txToday
    .filter(t =>
      (t.type || t.kind || "").toLowerCase().includes("expense") ||
      (t.category || "").toLowerCase().includes("egreso")
    )
    .reduce((a, t) => a + (t.amount ?? 0), 0);

  const netToday = incomeToday - expenseToday;

  const generatedAt = new Date().toISOString();
  const generatedAtLocal = new Date().toLocaleString("es-EC");

  return {
    meta: { generatedAt, generatedAtLocal },
    keys: { total: totalKeys, available: availableKeys, availableMen, availableWomen, busy },
    people: { today: 0 },
    money: { incomeToday, expenseToday, netToday, txCountToday: txToday.length },
    pos: { openAccounts: 0 },
    bar: { salesToday: 0 },
    parking: { countToday: 0 },
    passes: { entriesToday: 0 },
  };
}
