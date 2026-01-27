'use client';

import type { CashBoxSummary } from '@/lib/api/types';
import { formatCurrency } from '../utils/formatCurrency';

interface DailyReportCardProps {
  summary: CashBoxSummary;
}

const TZ = 'America/Guayaquil';

function normalizeUtc(dateString: string) {
  // Si el backend no manda zona horaria, asumimos UTC
  const hasTZ = /([zZ]|[+-]\d{2}:\d{2})$/.test(dateString);
  return hasTZ ? dateString : `${dateString}Z`;
}

function formatLongDate(dateString: string) {
  return new Date(normalizeUtc(dateString)).toLocaleDateString('es-EC', {
    timeZone: TZ,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(dateString: string) {
  return new Date(normalizeUtc(dateString)).toLocaleTimeString('es-EC', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function DailyReportCard({ summary }: DailyReportCardProps) {
  const { cashBox, totalPayments, cash, transfer, openTransactions, closedTransactions } = summary;
  const manualExpense = (summary as any).manualExpense ?? 0;
  const closingBalance = cashBox.closingBalance ?? (cashBox.openingBalance + totalPayments - manualExpense);

  const totalTransactions = openTransactions + closedTransactions;

  return (
    <div id="daily-report" className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-4">
        <h2 className="text-lg font-semibold">Reporte de Cierre</h2>
        <p className="text-gray-300 text-sm capitalize">{formatLongDate(cashBox.openedAt)}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Time info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Apertura:</span>
            <span className="ml-2 font-medium">{formatTime(cashBox.openedAt)}</span>
          </div>
          <div>
            <span className="text-gray-500">Cierre:</span>
            <span className="ml-2 font-medium">
              {cashBox.closedAt ? formatTime(cashBox.closedAt) : '-'}
            </span>
          </div>
        </div>

        {/* Financial summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            Resumen Financiero
          </h3>
          <div className="space-y-2">
            <SummaryRow label="Caja Inicial" value={formatCurrency(cashBox.openingBalance)} />
            <SummaryRow
              label="Ingresos Totales"
              value={`+${formatCurrency(totalPayments)}`}
              valueClassName="text-green-600"
            />

            <div className="border-t border-gray-200 pt-2">
            <SummaryRow
              label="Egresos Totales"
              value={`-${formatCurrency(manualExpense)}`}
              valueClassName="text-red-600"
            />
            </div>
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            Desglose por Tipo de Pago
          </h3>
          <div className="space-y-2">
            <SummaryRow
              label="Efectivo"
              value={formatCurrency(cash ?? 0)}
              icon={
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <SummaryRow
              label="Transferencia"
              value={formatCurrency(transfer ?? 0)}
              icon={
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            />
          </div>
        </div>

        {/* Transaction counts */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
            Transacciones
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-2xl font-bold text-green-700">{closedTransactions}</p>
              <p className="text-xs text-gray-500">Cerradas</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-2xl font-bold text-yellow-700">{openTransactions}</p>
              <p className="text-xs text-gray-500">Abiertas</p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {cashBox.notes && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              Notas
            </h3>
            <p className="text-sm text-gray-600 italic">{cashBox.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  valueClassName?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
}

function SummaryRow({ label, value, valueClassName = '', labelClassName = '', icon }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm text-gray-600 ${labelClassName}`}>{label}</span>
      </div>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}
