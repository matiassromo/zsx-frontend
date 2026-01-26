// ClientsTable.tsx
'use client';

import { useMemo, useState } from 'react';
import type { Client } from '@/lib/api/types';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
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
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
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
            <div className="h-4 bg-gray-200 rounded w-32" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>
          <td className="hidden md:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-24" />
          </td>
          <td className="hidden lg:table-cell px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-40" />
          </td>
          <td className="px-4 py-3">
            <div className="h-4 bg-gray-200 rounded w-16" />
          </td>
        </tr>
      ))}
    </>
  );
}

function normalize(s: unknown) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function ClientsTable({ clients, isLoading, onEdit, onDelete }: ClientsTableProps) {
  const [query, setQuery] = useState('');

  const filteredClients = useMemo(() => {
    if (!query) return clients;

    const q = normalize(query);

    return clients.filter((c) => {
      const haystack = [c.name, c.documentType, c.documentNumber, c.email]
        .map(normalize)
        .join(' ');

      return haystack.includes(q);
    });
  }, [clients, query]);

  const showEmptyAll = !isLoading && clients.length === 0;
  const showEmptyFiltered =
    !isLoading && clients.length > 0 && filteredClients.length === 0 && query.trim();

  if (showEmptyAll) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza agregando un nuevo cliente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg border border-gray-200 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.6-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, documento o email..."
              className="w-full pl-9 pr-10 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                aria-label="Limpiar búsqueda"
                title="Limpiar"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {!isLoading && (
            <div className="text-xs text-gray-500 whitespace-nowrap">
              {filteredClients.length} / {clients.length}
            </div>
          )}
        </div>

        {showEmptyFiltered && (
          <div className="mt-2 text-sm text-gray-600 flex items-center justify-between">
            <span>No hay resultados para “{query.trim()}”.</span>
            <button type="button" onClick={() => setQuery('')} className="text-blue-600 hover:text-blue-700 font-medium">
              Limpiar
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Doc.</th>
              <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{client.documentType || '-'}</td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{client.documentNumber || '-'}</td>
                  <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">{client.email || '-'}</td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton label="Editar" onClick={() => onEdit(client)}>
                        <PencilIcon className="h-5 w-5" />
                      </IconButton>

                      <IconButton label="Eliminar" variant="danger" onClick={() => onDelete(client)}>
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
