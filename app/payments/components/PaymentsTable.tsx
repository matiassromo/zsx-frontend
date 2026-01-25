'use client';

import { formatCurrency } from '@/app/facturacion/caja-diaria/utils/formatCurrency';
import type { PaymentWithTransaction } from '../hooks/usePayments';

interface PaymentsTableProps {
  payments: PaymentWithTransaction[];
  isLoading: boolean;
  onEdit: (payment: PaymentWithTransaction) => void;
  onDelete: (payment: PaymentWithTransaction) => void;
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

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </td>
          <td className="px-4 py-3">
            <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function PaymentsTable({
  payments,
  isLoading,
  onEdit,
  onDelete,
}: PaymentsTableProps) {
  if (!isLoading && payments.length === 0) {
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza registrando un nuevo pago.</p>
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
                Total
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
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
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {payment.client?.name || 'Sin cliente'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                    {formatCurrency(payment.total)}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.type === 'Efectivo'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {payment.type}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                    {formatDateTime(payment.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(payment)}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(payment)}
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
