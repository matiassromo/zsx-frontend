'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { ClientSearchCombobox } from '@/app/components/ui/ClientSearchCombobox';
import { createTransaction } from '@/lib/api/transactions';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess }: CreateTransactionModalProps) {
  const [clientId, setClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      setError('Seleccione un cliente');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createTransaction({ clientId });
      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setClientId('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Cuenta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ClientSearchCombobox
          value={clientId}
          onChange={setClientId}
          error={!clientId && error ? 'Seleccione un cliente' : undefined}
        />

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
            disabled={isSubmitting || !clientId}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
