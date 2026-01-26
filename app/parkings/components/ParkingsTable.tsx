// ParkingsTable.tsx
'use client';

import { formatCurrency } from '@/app/facturacion/caja-diaria/utils/formatCurrency';
import type { ParkingWithTransaction } from '../hooks/useParkings';

interface ParkingsTableProps {
  parkings: ParkingWithTransaction[];
  isLoading: boolean;
  onEdit: (parking: ParkingWithTransaction) => void;
  onDelete: (parking: ParkingWithTransaction) => void;
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
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
          </td>
          <td className="hidden lg:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-28" />
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

export function ParkingsTable({ parkings, isLoading, onEdit, onDelete }: ParkingsTableProps) {
  if (!isLoading && parkings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3M4 11h16M5 21h14a2 2 0 002-2v-8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay parqueos</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza registrando un nuevo parqueo.</p>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaccion</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrada</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salida</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              parkings.map((parking) => (
                <tr key={parking.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{parking.owner?.name || 'Sin cliente'}</td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-gray-900">{formatTransactionId(parking.transactionId)}</p>
                      {parking.transactionId && <p className="text-xs text-gray-400 font-mono">{parking.transactionId}</p>}
                    </div>
                  </td>

                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{formatDateTime(parking.entryTime)}</td>

                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                    {parking.exitTime ? formatDateTime(parking.exitTime) : 'En curso'}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(parking.total)}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton label="Editar" onClick={() => onEdit(parking)}>
                        <PencilIcon className="h-5 w-5" />
                      </IconButton>

                      <IconButton label="Eliminar" variant="danger" onClick={() => onDelete(parking)}>
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
