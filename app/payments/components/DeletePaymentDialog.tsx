'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deletePayment } from '@/lib/api/payments';
import type { PaymentWithTransaction } from '../hooks/usePayments';
import toast from 'react-hot-toast';

interface DeletePaymentDialogProps {
  payment: PaymentWithTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePaymentDialog({
  payment,
  isOpen,
  onClose,
  onSuccess,
}: DeletePaymentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!payment) return;

    setIsDeleting(true);

    try {
      await deletePayment(payment.id);
      toast.success('Pago eliminado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar pago';
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
      title="Eliminar Pago"
      message="¿Estás seguro de que deseas eliminar este pago? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
