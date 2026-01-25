'use client';

import type { AccessCardWithUsage } from '../hooks/useAccessCards';
import { AccessCardStatusChip } from './AccessCardStatusChip';
import { PassesIndicator } from './PassesIndicator';

interface AccessCardsTableProps {
  accessCards: AccessCardWithUsage[];
  isLoading: boolean;
  onEdit: (card: AccessCardWithUsage) => void;
  onDelete: (card: AccessCardWithUsage) => void;
  onUsePass: (card: AccessCardWithUsage) => void;
}

const MAX_PASSES = 10;

function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('es-EC', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCardId(id: string): string {
  return `#${id.substring(0, 8)}`;
}

function TableSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-20" />
          </td>
          <td className="px-4 py-3">
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="space-y-1">
              <div className="h-4 bg-gray-200 rounded w-12" />
              <div className="h-3 bg-gray-200 rounded w-16" />
            </div>
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>
          <td className="px-4 py-3">
            <div className="h-6 bg-gray-200 rounded w-20" />
          </td>
          <td className="px-4 py-3">
            <div className="h-8 bg-gray-200 rounded w-24" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function AccessCardsTable({
  accessCards,
  isLoading,
  onEdit,
  onDelete,
  onUsePass,
}: AccessCardsTableProps) {
  if (!isLoading && accessCards.length === 0) {
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
            d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay tarjetas de 10 pases</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva tarjeta.</p>
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
                Dueno
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tarjeta
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pases Usados
              </th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ultimo Uso
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
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
              accessCards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {card.owner?.name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatCardId(card.id)}</p>
                      <p className="text-xs text-gray-400 font-mono">{card.id}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PassesIndicator used={card.usedPasses} total={MAX_PASSES} />
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                    {formatDate(card.lastUsedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <AccessCardStatusChip isActive={card.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {card.isActive && (
                        <button
                          onClick={() => onUsePass(card)}
                          className="px-3 py-1.5 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                        >
                          Usar
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(card)}
                        className="px-3 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(card)}
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
