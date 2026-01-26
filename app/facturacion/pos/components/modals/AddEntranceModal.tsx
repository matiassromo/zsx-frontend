'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { NumberStepper } from '@/app/components/ui/NumberStepper';
import {
  createEntranceTransaction,
  updateEntranceTransaction,
  deleteEntranceTransaction,
} from '@/lib/api/entrance-transactions';

type EntranceValues = {
  numberAdults: number;
  numberChildren: number;
  numberSeniors: number;
  numberDisabled: number;
};

interface AddEntranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;

  // NEW
  mode?: 'create' | 'edit';
  entranceId?: string; // requerido en edit para update/delete
  initialValues?: Partial<EntranceValues>;
}

export function AddEntranceModal({
  isOpen,
  onClose,
  transactionId,
  onSuccess,
  mode = 'create',
  entranceId,
  initialValues,
}: AddEntranceModalProps) {
  const [numberAdults, setNumberAdults] = useState(1);
  const [numberChildren, setNumberChildren] = useState(0);
  const [numberSeniors, setNumberSeniors] = useState(0);
  const [numberDisabled, setNumberDisabled] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    // precarga al abrir
    setNumberAdults(initialValues?.numberAdults ?? (mode === 'create' ? 1 : 0));
    setNumberChildren(initialValues?.numberChildren ?? 0);
    setNumberSeniors(initialValues?.numberSeniors ?? 0);
    setNumberDisabled(initialValues?.numberDisabled ?? 0);
    setError('');
  }, [isOpen, mode, initialValues]);

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

      if (mode === 'edit') {
        if (!entranceId) throw new Error('Falta entranceId para editar');

        await updateEntranceTransaction(entranceId, {
          transactionId,
          entryTime: new Date().toISOString(),
          numberAdults,
          numberChildren,
          numberSeniors,
          numberDisabled,
        });
      } else {
        await createEntranceTransaction({
          transactionId,
          entryTime: new Date().toISOString(),
          numberAdults,
          numberChildren,
          numberSeniors,
          numberDisabled,
        });
      }

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!entranceId) return;
    try {
      setIsSubmitting(true);
      setError('');
      await deleteEntranceTransaction(entranceId);
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Editar Entrada' : 'Registrar Entrada'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <NumberStepper label="Adultos" value={numberAdults} onChange={setNumberAdults} min={0} max={99} />
          <NumberStepper label="Niños" value={numberChildren} onChange={setNumberChildren} min={0} max={99} />
          <NumberStepper label="Tercera Edad" value={numberSeniors} onChange={setNumberSeniors} min={0} max={99} />
          <NumberStepper label="Discapacitados" value={numberDisabled} onChange={setNumberDisabled} min={0} max={99} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          {mode === 'edit' && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
            >
              Eliminar
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
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
            {isSubmitting ? 'Guardando...' : mode === 'edit' ? 'Guardar cambios' : 'Registrar Entrada'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
