'use client';

import type { Key } from '@/lib/api/types';

interface KeyCardProps {
  keyData: Key;
  onClick: (key: Key) => void;
}

export function KeyCard({ keyData, onClick }: KeyCardProps) {
  const isAvailable = keyData.available;
  const clientName = keyData.lastAssignedClient?.name || 'Desconocido';

  return (
    <button
      onClick={() => onClick(keyData)}
      className={`
        w-full p-4 rounded-lg text-left transition-all
        ${isAvailable
          ? 'bg-green-100 hover:bg-green-200 border border-green-300'
          : 'bg-red-100 hover:bg-red-200 border border-red-300'
        }
      `}
    >
      <div className="font-semibold text-lg text-gray-900">
        {keyData.keyCode}
      </div>
      <div className={`text-sm ${isAvailable ? 'text-green-700' : 'text-red-700'}`}>
        {isAvailable ? 'Libre' : 'Ocupada'}
      </div>
      {!isAvailable && (
        <div className="text-xs text-gray-600 mt-1 truncate">
          {clientName}
        </div>
      )}
    </button>
  );
}
