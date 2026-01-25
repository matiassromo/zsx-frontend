'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { TransactionsTable } from './components/TransactionsTable';
import { CreateTransactionFormModal } from './components/CreateTransactionFormModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { CloseTransactionDialog } from './components/CloseTransactionDialog';
import { DeleteTransactionDialog } from './components/DeleteTransactionDialog';
import { useTransactions } from './hooks/useTransactions';
import { useCashBox } from '@/app/caja-diaria/hooks/useCashBox';
import type { Transaction } from '@/lib/api/types';

export default function TransaccionesPage() {
  const { transactions, isLoading, refetch } = useTransactions();
  const { cashBox, isLoading: isCashBoxLoading } = useCashBox();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [closingTransaction, setClosingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);

  const isCashBoxOpen = cashBox?.status === 'Open';

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingTransaction(null);
  };

  const handleCloseSuccess = () => {
    refetch();
    setClosingTransaction(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingTransaction(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Transacciones" />

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <CreateButton
            label="Nueva transaccion"
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!isCashBoxOpen}
          />
          {!isCashBoxLoading && !isCashBoxOpen && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-md border border-amber-200">
              Abra una caja primero
            </span>
          )}
        </div>
      </div>

      <TransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={setEditingTransaction}
        onClose={setClosingTransaction}
        onDelete={setDeletingTransaction}
      />

      {/* Create Modal - only open if cashbox is open */}
      <CreateTransactionFormModal
        isOpen={isCreateModalOpen && isCashBoxOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <TransactionFormModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={handleEditSuccess}
        transaction={editingTransaction || undefined}
      />

      {/* Close Transaction Dialog */}
      <CloseTransactionDialog
        transaction={closingTransaction}
        isOpen={!!closingTransaction}
        onClose={() => setClosingTransaction(null)}
        onSuccess={handleCloseSuccess}
      />

      {/* Delete Transaction Dialog */}
      <DeleteTransactionDialog
        transaction={deletingTransaction}
        isOpen={!!deletingTransaction}
        onClose={() => setDeletingTransaction(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
