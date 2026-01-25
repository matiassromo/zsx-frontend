'use client';

import { useState, useMemo } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { KeysGrid } from './components/KeysGrid';
import { ReleaseKeyDialog } from './components/ReleaseKeyDialog';
import { useKeys } from './hooks/useKeys';
import type { Key } from '@/lib/api/types';

function sortByNumericPrefix(a: Key, b: Key): number {
  const numA = parseInt(a.keyCode.slice(0, -1), 10);
  const numB = parseInt(b.keyCode.slice(0, -1), 10);
  return numA - numB;
}

export default function LockersPage() {
  const { keys, isLoading, refetch } = useKeys();
  const [releasingKey, setReleasingKey] = useState<Key | null>(null);

  const menKeys = useMemo(
    () => keys.filter((k) => k.keyCode.endsWith('H')).sort(sortByNumericPrefix),
    [keys]
  );

  const womenKeys = useMemo(
    () => keys.filter((k) => k.keyCode.endsWith('M')).sort(sortByNumericPrefix),
    [keys]
  );

  const totalKeys = keys.length;
  const availableKeys = keys.filter((k) => k.available).length;
  const occupiedKeys = totalKeys - availableKeys;

  const handleKeyClick = (key: Key) => {
    // Solo interesa la asignación activa (ocupada) -> liberar
    if (!key.available) setReleasingKey(key);
    // Si está libre: no mostrar nada
  };

  const handleReleaseSuccess = () => {
    refetch();
    setReleasingKey(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="LOCKERS" />

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          Total: {totalKeys}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Disponibles: {availableKeys}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          Ocupados: {occupiedKeys}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
          Hombres: {menKeys.length}
        </span>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-700">
          Mujeres: {womenKeys.length}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <KeysGrid
          title="Hombres"
          keys={menKeys}
          onKeyClick={handleKeyClick}
          isLoading={isLoading}
        />
        <KeysGrid
          title="Mujeres"
          keys={womenKeys}
          onKeyClick={handleKeyClick}
          isLoading={isLoading}
        />
      </div>

      <ReleaseKeyDialog
        keyData={releasingKey}
        isOpen={!!releasingKey}
        onClose={() => setReleasingKey(null)}
        onSuccess={handleReleaseSuccess}
      />
    </div>
  );
}
