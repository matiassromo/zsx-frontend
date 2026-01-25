'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { createParking } from '@/lib/api/parkings';

interface AddParkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
}

export function AddParkingModal({ isOpen, onClose, transactionId, onSuccess }: AddParkingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      await createParking({
        transactionId,
        entryTime: new Date().toISOString(),
      });
      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar parqueo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Parqueo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">
          Se registrara la entrada de parqueo con la hora actual.
        </p>

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
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Parqueo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
