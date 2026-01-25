// src/lib/api/dashboard.ts
import { getKeys } from "@/lib/api/keys";
import { getTodayCashBox, getCashBoxSummary } from "@/lib/api/cash-boxes";
import { getEntranceTransactions } from "@/lib/api/entrance-transactions";
import type { Key, EntranceTransaction } from "@/lib/api/types";

type KeyLike = { status?: string; gender?: string; isAvailable?: boolean; available?: boolean };

function asArray<T>(x: T[] | { items?: T[]; data?: T[]; result?: T[] } | null | undefined): T[] {
  if (Array.isArray(x)) return x;
  if (x && typeof x === 'object') {
    if (Array.isArray((x as { items?: T[] }).items)) return (x as { items: T[] }).items;
    if (Array.isArray((x as { data?: T[] }).data)) return (x as { data: T[] }).data;
    if (Array.isArray((x as { result?: T[] }).result)) return (x as { result: T[] }).result;
  }
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

  const keys = asArray<Key>(keysRes) as (Key & KeyLike)[];

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
  const entrances = asArray<EntranceTransaction>(entrancesRes);

  const entrancesToday = entrances.filter((e) => {
    const d =
      toDateMaybe(e?.entryTime) ||
      toDateMaybe(e?.createdAt);
    return d ? isToday(d) : false;
  });

  const peopleToday = entrancesToday.reduce((acc: number, e) => {
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
