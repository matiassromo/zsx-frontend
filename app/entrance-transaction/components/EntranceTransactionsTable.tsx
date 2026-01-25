'use client';

import { formatCurrency } from '@/app/caja-diaria/utils/formatCurrency';
import type { EntranceTransactionWithTransaction } from '../hooks/useEntranceTransactions';

interface EntranceTransactionsTableProps {
  entranceTransactions: EntranceTransactionWithTransaction[];
  isLoading: boolean;
  onEdit: (entranceTransaction: EntranceTransactionWithTransaction) => void;
  onDelete: (entranceTransaction: EntranceTransactionWithTransaction) => void;
}

function formatDateTime(value?: string | null): string {
  if (!value) return 'Sin dato';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin dato';
  return date.toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTransactionId(id?: string | null): string {
  if (!id) return 'Sin transaccion';
  return `#${id.substring(0, 8)}`;
}

function formatCountsShort(entranceTransaction: EntranceTransactionWithTransaction): string {
  return [
    `A:${entranceTransaction.numberAdults ?? 0}`,
    `N:${entranceTransaction.numberChildren ?? 0}`,
    `S:${entranceTransaction.numberSeniors ?? 0}`,
    `D:${entranceTransaction.numberDisabled ?? 0}`,
  ].join(' ');
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </td>
          <td className="hidden lg:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>
          <td className="px-4 py-3">
            <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function EntranceTransactionsTable({
  entranceTransactions,
  isLoading,
  onEdit,
  onDelete,
}: EntranceTransactionsTableProps) {
  if (!isLoading && entranceTransactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay entradas</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza registrando una nueva entrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-medium text-gray-900">Listado</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaccion
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Salida
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Personas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              entranceTransactions.map((entranceTransaction) => (
                <tr key={entranceTransaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">
                      {entranceTransaction.owner?.name || 'Sin cliente'}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 md:hidden">
                      {formatDateTime(entranceTransaction.entryTime)}{' '}
                      {entranceTransaction.exitTime
                        ? `- ${formatDateTime(entranceTransaction.exitTime)}`
                        : '- En curso'}
                    </div>
                    <div className="text-xs text-gray-500 md:hidden">
                      Personas: {formatCountsShort(entranceTransaction)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatTransactionId(entranceTransaction.transactionId)}
                      </p>
                      {entranceTransaction.transactionId && (
                        <p className="text-xs text-gray-400 font-mono">
                          {entranceTransaction.transactionId}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(entranceTransaction.entryTime)}
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                    {entranceTransaction.exitTime
                      ? formatDateTime(entranceTransaction.exitTime)
                      : 'En curso'}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-xs text-gray-600">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <span>Adultos: {entranceTransaction.numberAdults ?? 0}</span>
                      <span>Ninos: {entranceTransaction.numberChildren ?? 0}</span>
                      <span>Seniors: {entranceTransaction.numberSeniors ?? 0}</span>
                      <span>Discap.: {entranceTransaction.numberDisabled ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {formatCurrency(entranceTransaction.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(entranceTransaction)}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(entranceTransaction)}
                        className="px-3 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
