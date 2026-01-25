'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { useCashBox } from '@/app/caja-diaria/hooks/useCashBox';
import { usePosTransactions } from './hooks/usePosTransactions';
import { useTransactionDetail } from './hooks/useTransactionDetail';
import { CashBoxStatusPanel } from './components/CashBoxStatusPanel';
import { TransactionsList } from './components/TransactionsList';
import { TransactionDetailPanel } from './components/TransactionDetailPanel';
import { CreateTransactionModal } from './components/modals/CreateTransactionModal';

export default function PosPage() {
  const { summary, isLoading: isCashBoxLoading, refetch: refetchCashBox } = useCashBox();
  const { transactions, cashBox, isLoading: isTransactionsLoading, refetch: refetchTransactions } = usePosTransactions();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const { detail, isLoading: isDetailLoading, refetch: refetchDetail } = useTransactionDetail(selectedTransactionId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleRefetchAll = async () => {
    await Promise.all([refetchCashBox(), refetchTransactions()]);
    if (selectedTransactionId) {
      await refetchDetail();
    }
  };

  const handleTransactionCreated = async () => {
    await refetchTransactions();
    await refetchCashBox();
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactionId(id);
  };

  const handleDetailChange = async () => {
    await refetchDetail();
    await refetchTransactions();
    await refetchCashBox();
  };

  // Check if cash box is open
  const isCashBoxOpen = cashBox?.status === 'Open';

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <InfoBar title="POS - PUNTO DE VENTA" />

      {/* No cash box open warning */}
      {!isCashBoxLoading && !isCashBoxOpen && (
        <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              No hay caja abierta. Abre una caja en <a href="/caja-diaria" className="underline hover:no-underline">Caja Diaria</a> para empezar a trabajar.
            </p>
          </div>
        </div>
      )}

      {/* Main content - Three column layout */}
      <div className="mt-4 flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_400px] gap-4 min-h-0">
        {/* Left sidebar - Cash box status */}
        <aside className="hidden lg:block overflow-y-auto">
          <CashBoxStatusPanel
            summary={summary}
            isLoading={isCashBoxLoading}
          />
        </aside>

        {/* Center - Transactions list */}
        <main className="overflow-y-auto">
          <TransactionsList
            transactions={transactions}
            isLoading={isTransactionsLoading}
            selectedId={selectedTransactionId}
            onSelect={handleSelectTransaction}
            onCreateNew={() => setIsCreateModalOpen(true)}
            isCashBoxOpen={isCashBoxOpen}
          />
        </main>

        {/* Right panel - Transaction detail */}
        <aside className="hidden lg:block overflow-y-auto">
          <TransactionDetailPanel
            detail={detail}
            isLoading={isDetailLoading}
            onRefresh={handleDetailChange}
          />
        </aside>
      </div>

      {/* Create transaction modal */}
      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />
    </div>
  );
}
