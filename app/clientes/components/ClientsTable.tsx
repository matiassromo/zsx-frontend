'use client';

import type { Client } from '@/lib/api/types';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
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

export function ClientsTable({ clients, isLoading, onEdit, onDelete }: ClientsTableProps) {
  if (!isLoading && clients.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza agregando un nuevo cliente.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo Doc.
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
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
            clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{client.name}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                  {client.documentType || '-'}
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                  {client.documentNumber || '-'}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                  {client.email || '-'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(client)}
                      className="p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      aria-label={`Editar ${client.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      aria-label={`Eliminar ${client.name}`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
