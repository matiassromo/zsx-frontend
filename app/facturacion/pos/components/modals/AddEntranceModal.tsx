'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { NumberStepper } from '@/app/components/ui/NumberStepper';
import { createEntranceTransaction } from '@/lib/api/entrance-transactions';

interface AddEntranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
}

export function AddEntranceModal({ isOpen, onClose, transactionId, onSuccess }: AddEntranceModalProps) {
  const [numberAdults, setNumberAdults] = useState(1);
  const [numberChildren, setNumberChildren] = useState(0);
  const [numberSeniors, setNumberSeniors] = useState(0);
  const [numberDisabled, setNumberDisabled] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPersons = numberAdults + numberChildren + numberSeniors + numberDisabled;
    if (totalPersons === 0) {
      setError('Ingrese al menos una persona');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createEntranceTransaction({
        transactionId,
        entryTime: new Date().toISOString(),
        numberAdults,
        numberChildren,
        numberSeniors,
        numberDisabled,
      });

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNumberAdults(1);
    setNumberChildren(0);
    setNumberSeniors(0);
    setNumberDisabled(0);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Entrada">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberStepper
            label="Adultos"
            value={numberAdults}
            onChange={setNumberAdults}
            min={0}
            max={99}
          />
          <NumberStepper
            label="Niños"
            value={numberChildren}
            onChange={setNumberChildren}
            min={0}
            max={99}
          />
          <NumberStepper
            label="Tercera Edad"
            value={numberSeniors}
            onChange={setNumberSeniors}
            min={0}
            max={99}
          />
          <NumberStepper
            label="Discapacitados"
            value={numberDisabled}
            onChange={setNumberDisabled}
            min={0}
            max={99}
          />
        </div>

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
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Entrada'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
