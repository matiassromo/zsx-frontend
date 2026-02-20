'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { closeTransaction } from '@/lib/api/transactions';

interface CloseTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  pendingBalance: number;
  onSuccess: () => Promise<void>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function CloseTransactionDialog({
  isOpen,
  onClose,
  transactionId,
  pendingBalance,
  onSuccess,
}: CloseTransactionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError('');
      await closeTransaction(transactionId);
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar la cuenta');
      setIsLoading(false);
    }
  };

  // Don't allow closing if there's a pending balance
  if (pendingBalance > 0) {
    return (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onClose}
        title="No se puede cerrar"
        message={`La cuenta tiene un saldo pendiente de ${formatCurrency(pendingBalance)}. Registre los pagos necesarios antes de cerrar.`}
        confirmLabel="Entendido"
        variant="default"
      />
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={isOpen && !error}
        onClose={onClose}
        onConfirm={handleConfirm}
        title="Cerrar Cuenta"
        message="¿Está seguro de que desea cerrar esta cuenta? Esta acción no se puede deshacer."
        confirmLabel="Cerrar Cuenta"
        variant="danger"
        isLoading={isLoading}
      />

      {/* Error dialog */}
      {error && (
        <ConfirmDialog
          isOpen={isOpen && !!error}
          onClose={() => {
            setError('');
            onClose();
          }}
          onConfirm={() => {
            setError('');
            onClose();
          }}
          title="Error"
          message={error}
          confirmLabel="Aceptar"
          variant="default"
        />
      )}
    </>
  );
}
