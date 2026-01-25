'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { deleteBarProduct } from '@/lib/api/bar-products';
import type { BarProduct } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface DeleteProductDialogProps {
  product: BarProduct | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProductDialog({ product, isOpen, onClose, onSuccess }: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!product) return;

    setIsDeleting(true);

    try {
      await deleteBarProduct(product.id);
      toast.success('Producto eliminado correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar producto';
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
      title="Eliminar Producto"
      message={`¿Estas seguro de que deseas eliminar "${product?.name}"? Esta accion no se puede deshacer.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isDeleting}
    />
  );
}
