'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteParking } from '@/lib/api/parkings';
import type { ParkingWithTransaction } from '../hooks/useParkings';
import toast from 'react-hot-toast';

interface DeleteParkingDialogProps {
  parking: ParkingWithTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteParkingDialog({
  parking,
  isOpen,
  onClose,
  onSuccess,
}: DeleteParkingDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!parking) return;

    setIsDeleting(true);

    try {
      await deleteParking(parking.id);
      toast.success('Parqueo eliminado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar parqueo';
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
      title="Eliminar Parqueo"
      message="¿Estás seguro de que deseas eliminar este parqueo? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
