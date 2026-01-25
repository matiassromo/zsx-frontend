'use client';

import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { getKeys, updateKey } from '@/lib/api/keys';
import type { Key } from '@/lib/api/types';

interface AssignKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
}

function sortByNumericPrefix(a: Key, b: Key): number {
  const numA = parseInt(a.keyCode.slice(0, -1), 10);
  const numB = parseInt(b.keyCode.slice(0, -1), 10);
  return numA - numB;
}

export function AssignKeyModal({ isOpen, onClose, transactionId, onSuccess }: AssignKeyModalProps) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedKeyIds, setSelectedKeyIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) loadKeys();
  }, [isOpen]);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      setError('');
      const allKeys = await getKeys();
      setKeys(allKeys.filter((k) => k.available));
    } catch {
      setError('Error al cargar llaves');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleKey = (id: string) => {
    setSelectedKeyIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maleKeys = useMemo(
    () => keys.filter((k) => k.keyCode.endsWith('H')).sort(sortByNumericPrefix),
    [keys]
  );
  const femaleKeys = useMemo(
    () => keys.filter((k) => k.keyCode.endsWith('M')).sort(sortByNumericPrefix),
    [keys]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedKeyIds.size === 0) {
      setError('Seleccione al menos una llave');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const now = new Date().toISOString();
      await Promise.all(
        Array.from(selectedKeyIds).map((keyId) =>
          updateKey(keyId, {
            transactionId,
            available: false,
            lastAssignedAt: now,
          })
        )
      );

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar llaves');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedKeyIds(new Set());
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Asignar Llave">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Cargando llaves...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay llaves disponibles</div>
        ) : (
          <>
            {maleKeys.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hombres</label>
                <div className="flex flex-wrap gap-2">
                  {maleKeys.map((key) => {
                    const active = selectedKeyIds.has(key.id);
                    return (
                      <button
                        key={key.id}
                        type="button"
                        onClick={() => toggleKey(key.id)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          active
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        aria-pressed={active}
                      >
                        {key.keyCode.replace('H', '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {femaleKeys.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mujeres</label>
                <div className="flex flex-wrap gap-2">
                  {femaleKeys.map((key) => {
                    const active = selectedKeyIds.has(key.id);
                    return (
                      <button
                        key={key.id}
                        type="button"
                        onClick={() => toggleKey(key.id)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          active
                            ? 'bg-pink-600 text-white'
                            : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                        }`}
                        aria-pressed={active}
                      >
                        {key.keyCode.replace('M', '')}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || selectedKeyIds.size === 0 || keys.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Asignando...' : `Asignar (${selectedKeyIds.size})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
