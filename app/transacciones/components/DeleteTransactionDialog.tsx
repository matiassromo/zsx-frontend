'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteTransaction } from '@/lib/api/transactions';
import type { Transaction } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteTransactionDialog({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}: DeleteTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!transaction) return;

    setIsDeleting(true);

    try {
      await deleteTransaction(transaction.id);
      toast.success('Transaccion eliminada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar transaccion';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Transaccion"
      message={`¿Estas seguro de que deseas eliminar la transaccion de "${transaction?.client?.name}"? Esta accion no se puede deshacer.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
