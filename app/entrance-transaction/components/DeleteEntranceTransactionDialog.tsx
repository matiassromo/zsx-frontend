'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteEntranceTransaction } from '@/lib/api/entrance-transactions';
import type { EntranceTransactionWithTransaction } from '../hooks/useEntranceTransactions';
import toast from 'react-hot-toast';

interface DeleteEntranceTransactionDialogProps {
  entranceTransaction: EntranceTransactionWithTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteEntranceTransactionDialog({
  entranceTransaction,
  isOpen,
  onClose,
  onSuccess,
}: DeleteEntranceTransactionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!entranceTransaction) return;

    setIsDeleting(true);

    try {
      await deleteEntranceTransaction(entranceTransaction.id);
      toast.success('Entrada eliminada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar entrada';
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
      title="Eliminar Entrada"
      message="Estas seguro de que deseas eliminar esta entrada? Esta accion no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
