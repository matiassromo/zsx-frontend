'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { updateKey } from '@/lib/api/keys';
import type { Key } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface ReleaseKeyDialogProps {
  keyData: Key | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReleaseKeyDialog({ keyData, isOpen, onClose, onSuccess }: ReleaseKeyDialogProps) {
  const [isReleasing, setIsReleasing] = useState(false);

  const clientName = keyData?.transaction?.client?.name || 'Desconocido';

  const handleRelease = async () => {
    if (!keyData) return;

    setIsReleasing(true);

    try {
      await updateKey(keyData.id, { available: true });
      toast.success(`Llave ${keyData.keyCode} liberada correctamente`);
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al liberar llave';
      toast.error(message);
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar liberacion" size="sm">
      <div className="flex flex-col items-center text-center -mt-4">
        {/* Question mark icon in teal circle */}
        <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Liberar {keyData?.keyCode}?
        </h3>

        <p className="text-gray-600 mb-6">
          Asignada a: {clientName}
        </p>

        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isReleasing}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleRelease}
            disabled={isReleasing}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
          >
            {isReleasing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Liberando...
              </span>
            ) : (
              'Si, liberar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
