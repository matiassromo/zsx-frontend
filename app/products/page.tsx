'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { ProductsTable } from './components/ProductsTable';
import { ProductFormModal } from './components/ProductFormModal';
import { DeleteProductDialog } from './components/DeleteProductDialog';
import { useBarProducts } from './hooks/useBarProducts';
import type { BarProduct } from '@/lib/api/types';

export default function ProductsPage() {
  const { products, isLoading, refetch } = useBarProducts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<BarProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<BarProduct | null>(null);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingProduct(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingProduct(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Productos" />

      <div className="flex justify-between items-center">
        <CreateButton label="Agregar producto" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <ProductsTable
        products={products}
        isLoading={isLoading}
        onEdit={setEditingProduct}
        onDelete={setDeletingProduct}
      />

      {/* Create Modal */}
      <ProductFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <ProductFormModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={handleEditSuccess}
        product={editingProduct || undefined}
      />

      {/* Delete Dialog */}
      <DeleteProductDialog
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
