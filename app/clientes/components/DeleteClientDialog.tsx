'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteClient } from '@/lib/api/clients';
import type { Client } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface DeleteClientDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteClientDialog({ client, isOpen, onClose, onSuccess }: DeleteClientDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!client) return;

    setIsDeleting(true);

    try {
      await deleteClient(client.id);
      toast.success('Cliente eliminado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar cliente';
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
      title="Eliminar Cliente"
      message={`¿Estas seguro de que deseas eliminar a "${client?.name}"? Esta accion no se puede deshacer.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
