'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { ClientSearchCombobox } from '@/app/components/ui/ClientSearchCombobox';
import { createTransaction } from '@/lib/api/transactions';
import { useCashBox } from '@/app/facturacion/caja-diaria/hooks/useCashBox';
import type { CashBox } from '@/lib/api/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;

  /**
   * Opcional: si quieres inyectar caja desde otra pantalla (POS).
   * Si NO lo pasas (ej: /transacciones), el modal usa useCashBox() automáticamente.
   */
  cashBox?: CashBox | null;
}

export function CreateTransactionModal({ isOpen, onClose, onSuccess, cashBox }: Props) {
  const { cashBox: hookCashBox, isLoading: isCashBoxLoading, error: cashBoxError } = useCashBox();

  const effectiveCashBox = useMemo(() => cashBox ?? hookCashBox, [cashBox, hookCashBox]);

  const [clientId, setClientId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setError('');
  }, [isOpen]);

  const handleClose = () => {
    setClientId('');
    setError('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      setError('Seleccione un cliente');
      return;
    }

    if (isCashBoxLoading) {
      setError('Cargando caja...');
      return;
    }

    if (cashBoxError) {
      setError(cashBoxError.message || 'Error al cargar la caja');
      return;
    }

    if (!effectiveCashBox || effectiveCashBox.status !== 'Open') {
      setError('No hay caja ABIERTA hoy. Abre caja antes de crear una cuenta.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createTransaction({
        clientId,
        cashBoxId: effectiveCashBox.id, // ✅ requerido por el backend actual
      });

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Nueva Transacción">
      <form onSubmit={handleSubmit} className="space-y-4">
        <ClientSearchCombobox
          value={clientId}
          onChange={setClientId}
          error={!clientId && error ? 'Seleccione un cliente' : undefined}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

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
            {isSubmitting ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
