'use client';

import { useState, useCallback, useEffect } from 'react';
import InfoBar from '@/app/components/InfoBar';
import {
  getCashBoxesByRange,
  getCashBoxSummary,
  getCashBoxTransactions,
} from '@/lib/api/cash-boxes';
import { getTransactionDetail } from '@/lib/api/transactions';
import type { CashBox, CashBoxSummary, Transaction, TransactionDetail } from '@/lib/api/types';

const TZ = 'America/Guayaquil';

const MONTHS_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function money(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

function normalizeUtc(s: string) {
  return /([zZ]|[+-]\d{2}:\d{2})$/.test(s) ? s : `${s}Z`;
}

function formatDayFull(openedAt: string) {
  return new Date(normalizeUtc(openedAt)).toLocaleDateString('es-EC', {
    timeZone: TZ,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateTime(s: string) {
  return new Date(normalizeUtc(s)).toLocaleString('es-EC', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(s: string) {
  return new Date(normalizeUtc(s)).toLocaleTimeString('es-EC', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fmtYMD(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getMonthRange(year: number, month: number) {
  const from = fmtYMD(year, month, 1);
  const lastDay = new Date(year, month, 0).getDate();
  const to = fmtYMD(year, month, lastDay);
  return { from, to };
}

// ─── Read-only Transaction Detail Modal ────────────────────────────────────

interface ChargeRow {
  label: string;
  qty?: number | null;
  unitPrice?: number | null;
  total: number;
}

function ChargeTable({ rows }: { rows: ChargeRow[] }) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400">Concepto</th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 w-14">Cant.</th>
            <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24 hidden sm:table-cell">P. Unit.</th>
            <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50/60">
              <td className="px-4 py-2.5 text-slate-700">{row.label}</td>
              <td className="px-3 py-2.5 text-right text-slate-500 tabular-nums">
                {row.qty != null ? row.qty : '—'}
              </td>
              <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums hidden sm:table-cell">
                {row.unitPrice != null ? money(row.unitPrice) : '—'}
              </td>
              <td className="px-4 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                {money(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChargeSection({
  title,
  subtotal,
  children,
}: {
  title: string;
  subtotal: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</div>
        <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
          Subtotal: {money(subtotal)}
        </div>
      </div>
      {children}
    </div>
  );
}

function ReadOnlyTxModal({
  txId,
  onClose,
}: {
  txId: string | null;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!txId) {
      setDetail(null);
      return;
    }
    setIsLoading(true);
    setError('');
    setDetail(null);
    getTransactionDetail(txId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar detalle'))
      .finally(() => setIsLoading(false));
  }, [txId]);

  if (!txId) return null;

  // Build charge rows per section
  const entranceRows: ChargeRow[] = detail?.entrances.map((e) => {
    const parts = [
      e.numberAdults > 0 ? `${e.numberAdults} Adulto${e.numberAdults !== 1 ? 's' : ''}` : null,
      e.numberChildren > 0 ? `${e.numberChildren} Niño${e.numberChildren !== 1 ? 's' : ''}` : null,
      e.numberSeniors > 0 ? `${e.numberSeniors} Tercera edad` : null,
      e.numberDisabled > 0 ? `${e.numberDisabled} Discapacitado${e.numberDisabled !== 1 ? 's' : ''}` : null,
    ].filter(Boolean);
    const totalPeople = e.numberAdults + e.numberChildren + e.numberSeniors + e.numberDisabled;
    return {
      label: parts.join(', ') || 'Entrada',
      qty: totalPeople || null,
      unitPrice: null,
      total: e.total,
    };
  }) ?? [];

  const parkingRows: ChargeRow[] = detail?.parkings.map((p) => ({
    label: `Parqueo · Entrada: ${formatTime(p.entryTime)}${p.exitTime ? ` · Salida: ${formatTime(p.exitTime)}` : ' · En curso'}`,
    qty: 1,
    unitPrice: null,
    total: p.total,
  })) ?? [];

  const barRows: ChargeRow[] = detail?.barOrders.flatMap((order) =>
    (order.details ?? []).map((d) => {
      const qty = d.qty ?? 0;
      const unitPrice = d.unitPrice ?? 0;
      return {
        label: d.barProduct?.name ?? 'Producto',
        qty,
        unitPrice: unitPrice > 0 ? unitPrice : null,
        total: qty * unitPrice,
      };
    })
  ) ?? [];

  const accessCardRows: ChargeRow[] = detail?.accessCards.map((c) => ({
    label: `Tarjeta de acceso${c.uses > 0 ? ` (${c.uses} uso${c.uses !== 1 ? 's' : ''})` : ''}`,
    qty: null,
    unitPrice: null,
    total: c.total,
  })) ?? [];

  const paymentRows: ChargeRow[] = (detail?.transaction.payments ?? []).map((p) => ({
    label: p.type === 'Efectivo' ? 'Efectivo' : 'Transferencia',
    qty: null,
    unitPrice: null,
    total: p.total,
  }));

  const entranceSubtotal = entranceRows.reduce((s, r) => s + r.total, 0);
  const parkingSubtotal = parkingRows.reduce((s, r) => s + r.total, 0);
  const barSubtotal = barRows.reduce((s, r) => s + r.total, 0);
  const accessCardSubtotal = accessCardRows.reduce((s, r) => s + r.total, 0);
  const paymentsTotal = paymentRows.reduce((s, r) => s + r.total, 0);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl mb-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Detalle de cuenta</h2>
            <p className="text-xs text-slate-400 mt-0.5">Solo lectura · Registro histórico</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {isLoading && (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-500">
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-sm">Cargando detalle...</span>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {detail && (
            <>
              {/* ── Cliente ── */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Cliente</div>
                    <div className="text-sm font-semibold text-slate-900">
                      {detail.transaction.client?.name ?? 'Sin nombre'}
                    </div>
                    {detail.transaction.client?.documentNumber && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        CI/RUC: {detail.transaction.client.documentNumber}
                      </div>
                    )}
                    {detail.transaction.client?.number && (
                      <div className="text-xs text-slate-500">Tel: {detail.transaction.client.number}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                        detail.transaction.status === 'Closed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {detail.transaction.status === 'Closed' ? 'Cerrada' : 'Abierta'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1.5">
                      Apertura: {formatDateTime(detail.transaction.openedAt)}
                    </div>
                    {detail.transaction.closedAt && (
                      <div className="text-[10px] text-slate-400">
                        Cierre: {formatDateTime(detail.transaction.closedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Llaves asignadas (no tienen cargo) ── */}
              {detail.keys.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Llaves asignadas
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.keys.map((k) => (
                      <span
                        key={k.id}
                        className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        {k.keyCode}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Cobros realizados ── */}
              {(entranceRows.length > 0 || parkingRows.length > 0 || barRows.length > 0 || accessCardRows.length > 0) && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Cobros registrados
                  </div>
                  <div className="space-y-4">

                    {entranceRows.length > 0 && (
                      <ChargeSection title="Entradas" subtotal={entranceSubtotal}>
                        <ChargeTable rows={entranceRows} />
                      </ChargeSection>
                    )}

                    {parkingRows.length > 0 && (
                      <ChargeSection title="Parqueo" subtotal={parkingSubtotal}>
                        <ChargeTable rows={parkingRows} />
                      </ChargeSection>
                    )}

                    {barRows.length > 0 && (
                      <ChargeSection title="Bar" subtotal={barSubtotal}>
                        <ChargeTable rows={barRows} />
                      </ChargeSection>
                    )}

                    {accessCardRows.length > 0 && (
                      <ChargeSection title="Tarjetas de acceso" subtotal={accessCardSubtotal}>
                        <ChargeTable rows={accessCardRows} />
                      </ChargeSection>
                    )}
                  </div>
                </div>
              )}

              {/* ── Pagos recibidos ── */}
              {paymentRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pagos recibidos</div>
                    <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full tabular-nums">
                      Total: {money(paymentsTotal)}
                    </div>
                  </div>
                  <ChargeTable rows={paymentRows} />
                </div>
              )}

              {/* ── Resumen final ── */}
              <div className="rounded-xl border-2 border-slate-900 bg-slate-900 overflow-hidden">
                <div className="px-5 py-2.5 border-b border-slate-700">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Resumen de cuenta
                  </div>
                </div>
                <div className="px-5 py-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total cobrado</span>
                    <span className="font-semibold text-white tabular-nums">{money(detail.totalCharges)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total pagado</span>
                    <span className="font-semibold text-white tabular-nums">{money(detail.totalPayments)}</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between text-sm">
                    {detail.pendingBalance > 0 ? (
                      <>
                        <span className="font-bold text-amber-400">Saldo pendiente</span>
                        <span className="font-bold text-amber-400 tabular-nums">{money(detail.pendingBalance)}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-emerald-400">Cuenta pagada</span>
                        <span className="font-bold text-emerald-400">✓</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detalle expandible ────────────────────────────────────────────────────

function ExpandedDetail({
  cashBoxId,
  onSelectTx,
}: {
  cashBoxId: string;
  onSelectTx: (id: string) => void;
}) {
  const [summary, setSummary] = useState<CashBoxSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError('');
    Promise.all([
      getCashBoxSummary(cashBoxId),
      getCashBoxTransactions(cashBoxId),
    ])
      .then(([s, txs]) => {
        setSummary(s);
        setTransactions(txs ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar'))
      .finally(() => setIsLoading(false));
  }, [cashBoxId]);

  if (isLoading) {
    return (
      <div className="border-t border-slate-100 px-5 py-4 flex items-center gap-2 text-sm text-slate-500">
        <svg className="h-4 w-4 animate-spin shrink-0" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Cargando detalle...
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-slate-100 px-5 py-4 text-sm text-red-500">{error}</div>
    );
  }

  if (!summary) return null;

  return (
    <div className="border-t border-slate-100 bg-slate-50/40">
      {/* Métricas del día */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
        <MetricTile label="Efectivo" value={money(summary.cash)} color="text-slate-900" />
        <MetricTile label="Transferencia" value={money(summary.transfer)} color="text-slate-900" />
        <MetricTile
          label="Tx cerradas"
          value={String(summary.closedTransactions)}
          color="text-emerald-600"
        />
        <MetricTile
          label="Tx abiertas"
          value={String(summary.openTransactions)}
          color={summary.openTransactions > 0 ? 'text-amber-600' : 'text-slate-400'}
        />
      </div>

      {/* Lista de transacciones */}
      <div className="px-4 pb-4">
        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No hay transacciones registradas este día.</p>
        ) : (
          <>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Transacciones ({transactions.length}) · <span className="normal-case font-normal">haz clic para ver detalle</span>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white divide-y divide-slate-100">
              {transactions.map((tx) => {
                const totalPaid = tx.payments?.reduce((s, p) => s + p.total, 0) ?? 0;
                return (
                  <button
                    key={tx.id}
                    type="button"
                    onClick={() => onSelectTx(tx.id)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-blue-50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-900 truncate group-hover:text-blue-700 transition-colors">
                        {tx.client?.name ?? 'Sin nombre'}
                      </span>
                      {tx.client?.documentNumber && (
                        <span className="ml-2 text-xs text-slate-400">
                          {tx.client.documentNumber}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <span className="font-semibold text-slate-900">{money(totalPaid)}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                          tx.status === 'Closed'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {tx.status === 'Closed' ? 'Cerrada' : 'Abierta'}
                      </span>
                      <svg className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white border border-slate-100 px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={`mt-1 text-base font-bold ${color}`}>{value}</div>
    </div>
  );
}

// ─── Fila de caja ─────────────────────────────────────────────────────────

function CashBoxRow({
  cashBox,
  isExpanded,
  onToggle,
  onSelectTx,
}: {
  cashBox: CashBox;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectTx: (id: string) => void;
}) {
  const isClosed = cashBox.status === 'Closed';
  const dateLabel = formatDayFull(cashBox.openedAt);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        {/* Estado */}
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            isClosed ? 'bg-emerald-500' : 'bg-amber-400'
          }`}
        />

        {/* Fecha */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 capitalize">{dateLabel}</div>
          <div className="mt-0.5 text-xs text-slate-400">
            {isClosed
              ? `Cerrada · Saldo final: ${money(cashBox.closingBalance ?? 0)}`
              : 'Caja actualmente abierta'}
          </div>
        </div>

        {/* Balances — ocultos en pantallas muy pequeñas */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Inicial
            </div>
            <div className="text-sm font-semibold text-slate-700">
              {money(cashBox.openingBalance)}
            </div>
          </div>
          {cashBox.closingBalance != null && (
            <div className="text-right">
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                Cierre
              </div>
              <div className="text-sm font-bold text-emerald-700">
                {money(cashBox.closingBalance)}
              </div>
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {isExpanded && (
        <ExpandedDetail cashBoxId={cashBox.id} onSelectTx={onSelectTx} />
      )}
    </div>
  );
}

// ─── Página principal ──────────────────────────────────────────────────────

export default function HistorialPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-based

  const [cashBoxes, setCashBoxes] = useState<CashBox[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setExpandedId(null);
    const { from, to } = getMonthRange(year, month);
    try {
      const list = await getCashBoxesByRange(from, to);
      setCashBoxes(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando historial');
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    load();
  }, [load]);

  function prevMonth() {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    const isCurrentMonth =
      year === now.getFullYear() && month === now.getMonth() + 1;
    if (isCurrentMonth) return;
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const isCurrentMonth =
    year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <div className="space-y-6">
      <InfoBar title="HISTORIAL DE CAJAS" />

      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historial de Cajas</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Consulta y detalle de cada día de operación
        </p>
      </div>

      {/* Navegador de mes */}
      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex-1 text-center">
          <span className="text-base font-bold text-slate-900">
            {MONTHS_ES[month - 1]} {year}
          </span>
          {isCurrentMonth && (
            <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Mes actual
            </span>
          )}
        </div>

        <button
          onClick={nextMonth}
          disabled={isCurrentMonth}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {/* Cargando */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Cargando cajas...</span>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {!isLoading && !error && cashBoxes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">
            No hay cajas en {MONTHS_ES[month - 1]} {year}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Usa las flechas para navegar a otro mes
          </p>
        </div>
      )}

      {/* Lista de cajas */}
      {!isLoading && cashBoxes.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400 font-medium">
            {cashBoxes.length} {cashBoxes.length === 1 ? 'caja registrada' : 'cajas registradas'} en {MONTHS_ES[month - 1]} {year}
          </div>
          {cashBoxes.map((cb) => (
            <CashBoxRow
              key={cb.id}
              cashBox={cb}
              isExpanded={expandedId === cb.id}
              onToggle={() =>
                setExpandedId((prev) => (prev === cb.id ? null : cb.id))
              }
              onSelectTx={setSelectedTxId}
            />
          ))}
        </div>
      )}

      {/* Read-only transaction detail modal */}
      <ReadOnlyTxModal
        txId={selectedTxId}
        onClose={() => setSelectedTxId(null)}
      />
    </div>
  );
}
