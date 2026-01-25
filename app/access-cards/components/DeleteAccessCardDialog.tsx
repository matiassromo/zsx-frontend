'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteAccessCard } from '@/lib/api/access-cards';
import type { AccessCardWithUsage } from '../hooks/useAccessCards';
import toast from 'react-hot-toast';

interface DeleteAccessCardDialogProps {
  accessCard: AccessCardWithUsage | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteAccessCardDialog({
  accessCard,
  isOpen,
  onClose,
  onSuccess,
}: DeleteAccessCardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!accessCard) return;

    setIsDeleting(true);

    try {
      await deleteAccessCard(accessCard.id);
      toast.success('Tarjeta eliminada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar tarjeta';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const cardId = accessCard ? `#${accessCard.id.substring(0, 8)}` : '';

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Eliminar Tarjeta"
      message={`¿Estas seguro de que deseas eliminar la tarjeta "${cardId}"? Esta accion no se puede deshacer y se eliminaran todos los registros de uso asociados.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
