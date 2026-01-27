'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { ClientSearchCombobox } from '@/app/components/ui/ClientSearchCombobox';
import { createTransaction, updateTransaction } from '@/lib/api/transactions';
import { useCashBox } from '@/app/facturacion/caja-diaria/hooks/useCashBox';
import type { Transaction } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transaction?: Transaction;
}

export function TransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  transaction,
}: TransactionFormModalProps) {
  const { cashBox, isLoading: isCashBoxLoading, error: cashBoxError } = useCashBox();
  const [clientId, setClientId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!transaction;

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        setClientId(transaction.clientId);
      } else {
        setClientId('');
      }
      setError('');
    }
  }, [isOpen, transaction]);

  const validate = (): boolean => {
    if (!clientId) {
      setError('Debe seleccionar un cliente');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Check cash box for create mode
    if (!isEditMode) {
      if (isCashBoxLoading) {
        setError('Cargando caja...');
        return;
      }
      if (cashBoxError) {
        setError(cashBoxError.message || 'Error al cargar la caja');
        return;
      }
      if (!cashBox || cashBox.status !== 'Open') {
        setError('No hay caja abierta. Abre caja antes de crear una transaccion.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && transaction) {
        await updateTransaction(transaction.id, { clientId, cashBoxId: transaction.cashBoxId });
        toast.success('Transaccion actualizada correctamente');
      } else {
        await createTransaction({ clientId, cashBoxId: cashBox!.id });
        toast.success('Transaccion creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al guardar transaccion';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Transaccion' : 'Nueva Transaccion'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <ClientSearchCombobox
          value={clientId}
          onChange={(id) => {
            setClientId(id);
            if (error) setError('');
          }}
          error={error}
          label="Cliente"
          placeholder="Buscar cliente por nombre o documento..."
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
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
                Guardando...
              </span>
            ) : isEditMode ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
