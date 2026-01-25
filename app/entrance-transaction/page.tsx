'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { EntranceTransactionsTable } from './components/EntranceTransactionsTable';
import { EntranceTransactionFormModal } from './components/EntranceTransactionFormModal';
import { DeleteEntranceTransactionDialog } from './components/DeleteEntranceTransactionDialog';
import { useEntranceTransactions } from './hooks/useEntranceTransactions';
import type { EntranceTransactionWithTransaction } from './hooks/useEntranceTransactions';

export default function EntranceTransactionPage() {
  const { entranceTransactions, isLoading, refetch } = useEntranceTransactions();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEntranceTransaction, setEditingEntranceTransaction] =
    useState<EntranceTransactionWithTransaction | null>(null);
  const [deletingEntranceTransaction, setDeletingEntranceTransaction] =
    useState<EntranceTransactionWithTransaction | null>(null);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingEntranceTransaction(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingEntranceTransaction(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Entradas" />

      <div className="flex justify-between items-center">
        <CreateButton label="Agregar entrada" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <EntranceTransactionsTable
        entranceTransactions={entranceTransactions}
        isLoading={isLoading}
        onEdit={setEditingEntranceTransaction}
        onDelete={setDeletingEntranceTransaction}
      />

      <EntranceTransactionFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <EntranceTransactionFormModal
        isOpen={!!editingEntranceTransaction}
        onClose={() => setEditingEntranceTransaction(null)}
        onSuccess={handleEditSuccess}
        entranceTransaction={editingEntranceTransaction || undefined}
      />

      <DeleteEntranceTransactionDialog
        entranceTransaction={deletingEntranceTransaction}
        isOpen={!!deletingEntranceTransaction}
        onClose={() => setDeletingEntranceTransaction(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
