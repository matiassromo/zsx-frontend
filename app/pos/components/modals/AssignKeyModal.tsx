'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { getKeys, updateKey } from '@/lib/api/keys';
import type { Key } from '@/lib/api/types';

interface AssignKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
}

export function AssignKeyModal({ isOpen, onClose, transactionId, onSuccess }: AssignKeyModalProps) {
  const [keys, setKeys] = useState<Key[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadKeys();
    }
  }, [isOpen]);

  const loadKeys = async () => {
    try {
      setIsLoading(true);
      const allKeys = await getKeys();
      // Filter only available keys
      setKeys(allKeys.filter((k) => k.available));
    } catch (err) {
      setError('Error al cargar llaves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKeyId) {
      setError('Seleccione una llave');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await updateKey(selectedKeyId, {
        transactionId,
        available: false,
        lastAssignedAt: new Date().toISOString(),
      });
      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al asignar llave');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedKeyId('');
    setError('');
    onClose();
  };

  // Group keys by type (H = Hombre, M = Mujer)
  const maleKeys = keys.filter((k) => k.keyCode.endsWith('H'));
  const femaleKeys = keys.filter((k) => k.keyCode.endsWith('M'));

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Asignar Llave">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Cargando llaves...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay llaves disponibles</div>
        ) : (
          <>
            {/* Male keys */}
            {maleKeys.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hombres
                </label>
                <div className="flex flex-wrap gap-2">
                  {maleKeys.map((key) => (
                    <button
                      key={key.id}
                      type="button"
                      onClick={() => setSelectedKeyId(key.id)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        selectedKeyId === key.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                      }`}
                    >
                      {key.keyCode.replace('H', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Female keys */}
            {femaleKeys.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mujeres
                </label>
                <div className="flex flex-wrap gap-2">
                  {femaleKeys.map((key) => (
                    <button
                      key={key.id}
                      type="button"
                      onClick={() => setSelectedKeyId(key.id)}
                      className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                        selectedKeyId === key.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-pink-100 text-pink-800 hover:bg-pink-200'
                      }`}
                    >
                      {key.keyCode.replace('M', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

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
            disabled={isSubmitting || !selectedKeyId || keys.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Asignando...' : 'Asignar Llave'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
