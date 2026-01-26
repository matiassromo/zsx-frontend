// PaymentsTable.tsx
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

function IconButton({
  label,
  onClick,
  variant = 'neutral',
  children,
}: {
  label: string;
  onClick: () => void;
  variant?: 'neutral' | 'danger';
  children: React.ReactNode;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  const styles =
    variant === 'danger'
      ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
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

export function PaymentsTable({ payments, isLoading, onEdit, onDelete }: PaymentsTableProps) {
  if (!isLoading && payments.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{payment.client?.name || 'Sin cliente'}</td>

                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{formatCurrency(payment.total)}</td>

                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.type === 'Efectivo' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {payment.type}
                    </span>
                  </td>

                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{formatDateTime(payment.createdAt)}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton label="Editar" onClick={() => onEdit(payment)}>
                        <PencilIcon className="h-5 w-5" />
                      </IconButton>

                      <IconButton label="Eliminar" variant="danger" onClick={() => onDelete(payment)}>
                        <TrashIcon className="h-5 w-5" />
                      </IconButton>
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
