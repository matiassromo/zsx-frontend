'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { createAccessCard } from '@/lib/api/access-cards';

interface AddAccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
}

export function AddAccessCardModal({ isOpen, onClose, transactionId, onSuccess }: AddAccessCardModalProps) {
  const [uses, setUses] = useState(10);
  const [total, setTotal] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uses <= 0) {
      setError('Ingrese un numero de usos valido');
      return;
    }

    if (total <= 0) {
      setError('Ingrese un precio valido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createAccessCard({
        transactionId,
        uses,
        total,
      });
      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear tarjeta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUses(10);
    setTotal(25);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Tarjeta de Pases">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Numero de Usos"
          type="number"
          min={1}
          value={uses}
          onChange={(e) => setUses(parseInt(e.target.value) || 0)}
        />

        <Input
          label="Precio ($)"
          type="number"
          min={0}
          step={0.01}
          value={total}
          onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
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
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Agregando...' : 'Agregar Tarjeta'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
