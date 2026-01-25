'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { closeTransaction } from '@/lib/api/transactions';
import type { Transaction } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface CloseTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}: CloseTransactionDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleConfirm = async () => {
    if (!transaction) return;

    setIsClosing(true);

    try {
      await closeTransaction(transaction.id);
      toast.success('Transaccion cerrada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar transaccion';
      toast.error(message);
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Cerrar Transaccion"
      message={`¿Estas seguro de que deseas cerrar la transaccion de "${transaction?.client?.name}"? Una vez cerrada, no podra ser editada.`}
      confirmLabel="Cerrar"
      cancelLabel="Cancelar"
      variant="default"
      isLoading={isClosing}
    />
  );
}
