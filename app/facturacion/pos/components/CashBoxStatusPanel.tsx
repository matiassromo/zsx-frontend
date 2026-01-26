'use client';

import type { CashBoxSummary } from '@/lib/api/types';

interface CashBoxStatusPanelProps {
  summary: CashBoxSummary | null;
  isLoading: boolean;
}

const TZ = 'America/Guayaquil';

function normalizeUtc(dateString: string) {
  const hasTZ = /([zZ]|[+-]\d{2}:\d{2})$/.test(dateString);
  return hasTZ ? dateString : `${dateString}Z`;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(normalizeUtc(dateString)).toLocaleDateString('es-EC', {
    timeZone: TZ,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function CashBoxStatusPanel({ summary, isLoading }: CashBoxStatusPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-32" />
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500 text-center">Sin caja abierta</p>
      </div>
    );
  }

  const { cashBox, totalPayments, cash, transfer, openTransactions, closedTransactions } = summary;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Caja Diaria
        </h3>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              cashBox.status === 'Open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {cashBox.status === 'Open' ? 'Abierta' : 'Cerrada'}
          </span>
        </div>
        <p className="text-xs text-gray-500">{formatDate(cashBox.openedAt)}</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Resumen
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ingresos</span>
            <span className="font-medium text-gray-900">{formatCurrency(totalPayments)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Efectivo</span>
            <span className="font-medium text-gray-900">{formatCurrency(cash)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Transferencia</span>
            <span className="font-medium text-gray-900">{formatCurrency(transfer)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
          Cuentas
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Abiertas</span>
            <span className="font-medium text-yellow-600">{openTransactions}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Cerradas</span>
            <span className="font-medium text-green-600">{closedTransactions}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
