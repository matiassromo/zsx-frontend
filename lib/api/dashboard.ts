// src/lib/api/dashboard.ts
import { getKeys } from "@/lib/api/keys";
import { getTodayCashBox, getCashBoxSummary } from "@/lib/api/cash-boxes";
import { getEntranceTransactions } from "@/lib/api/entrance-transactions";

type KeyLike = { status?: string; gender?: string; isAvailable?: boolean; available?: boolean };

function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x as T[];
  if (Array.isArray(x?.items)) return x.items as T[];
  if (Array.isArray(x?.data)) return x.data as T[];
  if (Array.isArray(x?.result)) return x.result as T[];
  return [];
}

function isToday(d: Date) {
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

function toDateMaybe(x?: string) {
  if (!x) return null;
  const d = new Date(x);
  return Number.isNaN(d.getTime()) ? null : d;
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
  const [keysRes, todayCashBox, entrancesRes] = await Promise.all([
    getKeys().catch(() => []),
    getTodayCashBox().catch(() => null),
    getEntranceTransactions().catch(() => []),
  ]);

  const keys = asArray<KeyLike>(keysRes);

  // ✅ Keys
  const totalKeys = keys.length || 32;

  const isKeyAvailable = (k: KeyLike) =>
    k.available === true ||
    k.isAvailable === true ||
    k.status?.toLowerCase() === "available" ||
    k.status?.toLowerCase() === "libre";

  const availableKeys = keys.length ? keys.filter(isKeyAvailable).length : 0;

  const availableMen = keys.filter(
    (k) =>
      isKeyAvailable(k) &&
      (k.gender?.toLowerCase() === "men" ||
        k.gender?.toLowerCase() === "hombre" ||
        k.gender?.toLowerCase() === "male")
  ).length;

  const availableWomen = keys.filter(
    (k) =>
      isKeyAvailable(k) &&
      (k.gender?.toLowerCase() === "women" ||
        k.gender?.toLowerCase() === "mujer" ||
        k.gender?.toLowerCase() === "female")
  ).length;

  const busy = keys.length ? Math.max(0, keys.length - availableKeys) : 0;

  // ✅ Personas (día) = suma adultos + niños + tercera edad + discapacidad de entradas de HOY
  const entrances = asArray<any>(entrancesRes);

  const entrancesToday = entrances.filter((e: any) => {
    const d =
      toDateMaybe(e?.entryTime) ||
      toDateMaybe(e?.createdAt) ||
      toDateMaybe(e?.openedAt);
    return d ? isToday(d) : false;
  });

  const peopleToday = entrancesToday.reduce((acc: number, e: any) => {
    const a = Number(e?.numberAdults ?? 0);
    const c = Number(e?.numberChildren ?? 0);
    const s = Number(e?.numberSeniors ?? 0);
    const d = Number(e?.numberDisabled ?? 0);
    return acc + (Number.isFinite(a) ? a : 0) + (Number.isFinite(c) ? c : 0) + (Number.isFinite(s) ? s : 0) + (Number.isFinite(d) ? d : 0);
  }, 0);

  // ✅ CashBox Summary
  const summary = todayCashBox?.id
    ? await getCashBoxSummary(todayCashBox.id).catch(() => null)
    : null;

  const incomeToday = summary?.totalPayments ?? 0;
  const expenseToday = 0;
  const netToday = incomeToday - expenseToday;

  const openAccounts = summary?.openTransactions ?? 0;
  const txCountToday =
    (summary?.openTransactions ?? 0) + (summary?.closedTransactions ?? 0);

  const generatedAt = new Date().toISOString();
  const generatedAtLocal = new Date().toLocaleString("es-EC");

  return {
    meta: { generatedAt, generatedAtLocal },
    keys: { total: totalKeys, available: availableKeys, availableMen, availableWomen, busy },
    people: { today: peopleToday },
    money: { incomeToday, expenseToday, netToday, txCountToday },
    pos: { openAccounts },
    bar: { salesToday: 0 },
    parking: { countToday: 0 },
    passes: { entriesToday: 0 },
  };
}
