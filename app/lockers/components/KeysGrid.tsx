'use client';

import type { Key } from '@/lib/api/types';
import { KeyCard } from './KeyCard';

interface KeysGridProps {
  title: string;
  keys: Key[];
  onKeyClick: (key: Key) => void;
  isLoading: boolean;
}

function KeyCardSkeleton() {
  return (
    <div className="w-full p-4 rounded-lg bg-gray-100 border border-gray-200 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-12 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  );
}

export function KeysGrid({ title, keys, onKeyClick, isLoading }: KeysGridProps) {
  const availableCount = keys.filter((k) => k.available).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">
          {availableCount} disponibles de {keys.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <KeyCardSkeleton key={i} />)
          : keys.map((key) => (
              <KeyCard key={key.id} keyData={key} onClick={onKeyClick} />
            ))}
      </div>

      {!isLoading && keys.length === 0 && (
        <p className="text-center text-gray-500 py-8">No hay llaves registradas</p>
      )}
    </div>
  );
}
