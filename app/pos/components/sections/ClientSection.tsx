'use client';

import type { Client } from '@/lib/api/types';

interface ClientSectionProps {
  client?: Client | null;
}

export function ClientSection({ client }: ClientSectionProps) {
  return (
    <div className="p-4">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Cliente
      </h3>
      <p className="text-sm font-medium text-gray-900">
        {client?.name || 'Sin cliente'}
      </p>
      {client?.documentNumber && (
        <p className="text-xs text-gray-500">{client.documentNumber}</p>
      )}
      {client?.number && (
        <p className="text-xs text-gray-500">{client.number}</p>
      )}
    </div>
  );
}
