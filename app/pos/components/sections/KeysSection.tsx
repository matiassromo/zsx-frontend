'use client';

import { useState } from 'react';
import type { Key } from '@/lib/api/types';
import { updateKey } from '@/lib/api/keys';

interface KeysSectionProps {
  keys: Key[];
  isOpen: boolean;
  onAdd: () => void;
  onRefresh: () => Promise<void>;
}

export function KeysSection({ keys, isOpen, onAdd, onRefresh }: KeysSectionProps) {
  const [releasingKeyId, setReleasingKeyId] = useState<string | null>(null);

  const handleReleaseKey = async (keyId: string) => {
    try {
      setReleasingKeyId(keyId);
      await updateKey(keyId, {
        transactionId: null,
        available: true,
        lastAssignedAt: null,
      });
      await onRefresh();
    } catch (error) {
      console.error('Error releasing key:', error);
    } finally {
      setReleasingKeyId(null);
    }
  };

  const sortedKeys = [...keys].sort((a, b) => {
    const numA = parseInt(a.keyCode.slice(0, -1), 10);
    const numB = parseInt(b.keyCode.slice(0, -1), 10);
    const sufA = a.keyCode.slice(-1);
    const sufB = b.keyCode.slice(-1);
    if (sufA !== sufB) return sufA.localeCompare(sufB); // H primero si quieres, o quita esto
    return numA - numB;
  });

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Llaves
        </h3>
        {isOpen && (
          <button
            onClick={onAdd}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            + Asignar
          </button>
        )}
      </div>

      {sortedKeys.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Sin llaves asignadas</p>
      ) : (
        <div className="space-y-2">
          {sortedKeys.map((key) => {
            const isFemale = key.keyCode.endsWith('M');

            const chipClass = isFemale
              ? 'bg-pink-100 text-pink-800'
              : 'bg-blue-100 text-blue-800';

            // Si también quieres el texto coloreado por género, cambia esto:
            const labelClass = isFemale ? 'text-pink-700' : 'text-blue-700';

            return (
              <div key={key.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium ${chipClass}`}
                    title={isFemale ? 'Mujeres' : 'Hombres'}
                  >
                    {key.keyCode}
                  </span>

                  <span className={labelClass}>Llave #{key.keyCode}</span>
                </div>

                {isOpen && (
                  <button
                    onClick={() => handleReleaseKey(key.id)}
                    disabled={releasingKeyId === key.id}
                    className="text-xs text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {releasingKeyId === key.id ? 'Liberando...' : 'Liberar'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
