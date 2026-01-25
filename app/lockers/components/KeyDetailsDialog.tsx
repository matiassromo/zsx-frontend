'use client';

import { Modal } from '@/app/components/ui/Modal';
import type { Key } from '@/lib/api/types';

interface KeyDetailsDialogProps {
  keyData: Key | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function KeyDetailsDialog({ keyData, isOpen, onClose }: KeyDetailsDialogProps) {
  if (!keyData) return null;

  const lastClientName = keyData.transaction?.client?.name || 'N/A';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Llave ${keyData.keyCode}`} size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
            Libre
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500">Ultimo cliente asignado</dt>
            <dd className="text-sm text-gray-900">{lastClientName}</dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Ultima asignacion</dt>
            <dd className="text-sm text-gray-900">{formatDateTime(keyData.lastAssignedAt)}</dd>
          </div>

          {keyData.notes && (
            <div>
              <dt className="text-sm font-medium text-gray-500">Notas</dt>
              <dd className="text-sm text-gray-900">{keyData.notes}</dd>
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
}
