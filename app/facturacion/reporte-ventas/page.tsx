"use client";

import { useEffect, useMemo, useState } from "react";
import { getPayments } from "@/lib/api/payments";
import type { Payment } from "@/lib/api/types";

type GroupBy = "day" | "month" | "year";
type Preset = "day" | "month" | "year" | "range";

function parseLocalDate(yyyyMmDd: string): Date {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0); // LOCAL
}


function money(n: number) {
  return (n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
}

function safeDate(p: Payment): Date | null {
  const raw = p.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1, 0, 0, 0, 0);
}
function endOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
}
function startOfYear(year: number) {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}
function endOfYear(year: number) {
  return new Date(year, 11, 31, 23, 59, 59, 999);
}

function keyForGroup(d: Date, groupBy: GroupBy) {
  if (groupBy === "day")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  if (groupBy === "month")
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${d.getFullYear()}`;
}

function labelForGroupKey(key: string, groupBy: GroupBy) {
  if (groupBy === "day") {
    const [y, m, d] = key.split("-");
    return `${d}/${m}/${y}`;
  }
  if (groupBy === "month") {
    const [y, m] = key.split("-");
    return `${m}/${y}`;
  }
  return key;
}

function isCash(type: Payment["type"]) {
  return type === "Efectivo";
}
function isTransfer(type: Payment["type"]) {
  return type === "Transferencia";
}

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function fileSafeDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${da}`;
}


export default function ReporteVentasPage() {
  const now = new Date();

  const [preset, setPreset] = useState<Preset>("day");
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  const [day, setDay] = useState<string>(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  });

  const [month, setMonth] = useState<string>(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}`;
  });

  const [year, setYear] = useState<number>(() => now.getFullYear());

  const [from, setFrom] = useState<string>(() => {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  });
  const [to, setTo] = useState<string>(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const da = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (preset === "day") setGroupBy("day");
    if (preset === "month") setGroupBy("day");
    if (preset === "year") setGroupBy("month");
  }, [preset]);

  const range = useMemo(() => {
  if (preset === "day") {
    const d = parseLocalDate(day);
    return { from: startOfDay(d), to: endOfDay(d) };
  }
  if (preset === "month") {
    const [y, m] = month.split("-").map((x) => Number(x));
    const mi = (m ?? 1) - 1;
    return { from: startOfMonth(y, mi), to: endOfMonth(y, mi) };
  }
  if (preset === "year") {
    return { from: startOfYear(year), to: endOfYear(year) };
  }

  // range
  const f = parseLocalDate(from);
  const t = parseLocalDate(to);
  return { from: startOfDay(f), to: endOfDay(t) };
}, [preset, day, month, year, from, to]);


  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getPayments();
      setPayments(Array.isArray(list) ? list : []);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo cargar pagos.");
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
  const ch = new BroadcastChannel("zs-events");

  ch.onmessage = (ev) => {
    const msg = ev?.data;

    // acepta string o { type: string }
    const type = typeof msg === "string" ? msg : msg?.type;

    if (
      type === "payment:created" ||
      type === "pos:sale" ||
      type === "transactions:updated" ||
      type === "refresh:payments" ||
      type === "refresh:all"
    ) {
      load();
    }
  };

  return () => ch.close();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  const id = setInterval(() => load(), 30_000);
  return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  const filtered = useMemo(() => {
    const f = range.from.getTime();
    const t = range.to.getTime();
    return (payments ?? []).filter((p) => {
      const d = safeDate(p);
      if (!d) return false;
      const time = d.getTime();
      return time >= f && time <= t;
    });
  }, [payments, range.from, range.to]);

  const summary = useMemo(() => {
    let total = 0;
    let cash = 0;
    let transfer = 0;

    for (const p of filtered) {
      const amt = Number(p.total ?? 0);
      if (!Number.isFinite(amt)) continue;
      total += amt;
      if (isCash(p.type)) cash += amt;
      else if (isTransfer(p.type)) transfer += amt;
    }

    return { total, cash, transfer, count: filtered.length };
  }, [filtered]);

  const rows = useMemo(() => {
    const map = new Map<
      string,
      { key: string; total: number; cash: number; transfer: number; count: number }
    >();

    for (const p of filtered) {
      const d = safeDate(p);
      if (!d) continue;

      const k = keyForGroup(d, groupBy);
      const amt = Number(p.total ?? 0);
      if (!Number.isFinite(amt)) continue;

      const acc = map.get(k) ?? { key: k, total: 0, cash: 0, transfer: 0, count: 0 };
      acc.total += amt;
      if (isCash(p.type)) acc.cash += amt;
      else if (isTransfer(p.type)) acc.transfer += amt;
      acc.count += 1;

      map.set(k, acc);
    }

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered, groupBy]);

  const exportPdf = () => {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

  const title = "Reporte de Ventas";
  const rangeText = `${range.from.toLocaleDateString("es-EC")} — ${range.to.toLocaleDateString("es-EC")}`;
  const generatedAt = new Date().toLocaleString("es-EC");

  doc.setFontSize(16);
  doc.text(title, 40, 50);

  doc.setFontSize(10);
  doc.text(`Rango: ${rangeText}`, 40, 70);
  doc.text(`Agrupar por: ${groupBy.toUpperCase()}`, 40, 85);
  doc.text(`Generado: ${generatedAt}`, 40, 100);

  // KPIs
  doc.setFontSize(11);
  doc.text(`Total Ventas: ${money(summary.total)}`, 40, 125);
  doc.text(`Efectivo: ${money(summary.cash)}`, 220, 125);
  doc.text(`Transferencia: ${money(summary.transfer)}`, 360, 125);
  doc.text(`# Pagos: ${summary.count}`, 520, 125);

  // Tabla
  autoTable(doc, {
    startY: 150,
    head: [["Periodo", "Total", "Efectivo", "Transferencia", "#"]],
    body: rows.map((r) => [
      labelForGroupKey(r.key, groupBy),
      money(r.total),
      money(r.cash),
      money(r.transfer),
      String(r.count),
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [245, 245, 245], textColor: 50 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });

  const name = `reporte-ventas_${fileSafeDate(range.from)}-${fileSafeDate(range.to)}.pdf`;
  doc.save(name);
};


  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Reporte de Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Filtros por día, mes, año o rango. Agrupación configurable.
          </p>
        </div>

        <div className="flex items-center gap-3">
        <button
          onClick={exportPdf}
          className="rounded-full px-4 py-2 text-sm font-semibold bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
        >
          Exportar PDF
        </button>

        <button
          onClick={load}
          className="rounded-full px-4 py-2 text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
        >
          Recargar
        </button>
      </div>

      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <div className="text-xs text-gray-500">Modo</div>
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value as Preset)}
              className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
              <option value="range">Rango</option>
            </select>
          </div>

          {preset === "day" && (
            <div>
              <div className="text-xs text-gray-500">Día</div>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              />
            </div>
          )}

          {preset === "month" && (
            <div>
              <div className="text-xs text-gray-500">Mes</div>
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              />
            </div>
          )}

          {preset === "year" && (
            <div>
              <div className="text-xs text-gray-500">Año</div>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2000}
                max={2100}
                className="mt-1 h-10 w-28 rounded-lg border border-gray-200 bg-white px-3 text-sm"
              />
            </div>
          )}

          {preset === "range" && (
            <>
              <div>
                <div className="text-xs text-gray-500">Desde</div>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                />
              </div>
              <div>
                <div className="text-xs text-gray-500">Hasta</div>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
                />
              </div>
            </>
          )}

          <div className="ml-auto">
            <div className="text-xs text-gray-500">Agrupar por</div>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as GroupBy)}
              className="mt-1 h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm"
            >
              <option value="day">Día</option>
              <option value="month">Mes</option>
              <option value="year">Año</option>
            </select>
          </div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Rango actual:{" "}
          <span className="font-medium text-gray-700">
            {range.from.toLocaleDateString("es-EC")} — {range.to.toLocaleDateString("es-EC")}
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Total Ventas" value={money(summary.total)} tone="neutral" />
        <KpiCard title="Efectivo" value={money(summary.cash)} tone="green" />
        <KpiCard title="Transferencia" value={money(summary.transfer)} tone="blue" />
        <KpiCard title="# Pagos" value={summary.count} tone="neutral" />
      </div>

      <div className="mt-5 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-gray-900">Detalle</div>
          <div className="text-xs text-gray-500">
            {isLoading ? "Cargando…" : `${rows.length} registro(s)`}
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 text-sm text-red-700 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Periodo</th>
                <th className="text-right px-4 py-3 font-medium">Total</th>
                <th className="text-right px-4 py-3 font-medium">Efectivo</th>
                <th className="text-right px-4 py-3 font-medium">Transferencia</th>
                <th className="text-right px-4 py-3 font-medium">#</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    No hay datos para el filtro seleccionado.
                  </td>
                </tr>
              )}

              {rows.map((r) => (
                <tr key={r.key} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">
                    {labelForGroupKey(r.key, groupBy)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {money(r.total)}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{money(r.cash)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{money(r.transfer)}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string | number;
  tone: "neutral" | "green" | "blue";
}) {
  const toneCls =
    tone === "green"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "blue"
      ? "border-blue-200 bg-blue-50"
      : "border-gray-200 bg-white";

  const valueCls =
    tone === "green"
      ? "text-emerald-700"
      : tone === "blue"
      ? "text-blue-700"
      : "text-gray-900";

  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${toneCls}`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className={`mt-2 text-2xl font-semibold ${valueCls}`}>{value}</div>
    </div>
  );
}
