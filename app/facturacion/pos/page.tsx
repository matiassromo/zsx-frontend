'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { useCashBox } from '@/app/facturacion/caja-diaria/hooks/useCashBox';
import { usePosTransactions } from './hooks/usePosTransactions';
import { useTransactionDetail } from './hooks/useTransactionDetail';
import { CashBoxStatusPanel } from './components/CashBoxStatusPanel';
import { TransactionsList } from './components/TransactionsList';
import { TransactionDetailPanel } from './components/TransactionDetailPanel';
import { CreateTransactionModal } from './components/modals/CreateTransactionModal';

export default function PosPage() {
  // ✅ Fuente de verdad: Caja Diaria
    const {
      cashBox: todayCashBox,
      summary,
      isLoading: isCashBoxLoading,
      error: cashBoxError,
      refetch: refetchCashBox,
    } = useCashBox();


  // ✅ Lista de transacciones (tu hook actual)
  const {
    transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = usePosTransactions(todayCashBox?.id);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const { detail, isLoading: isDetailLoading, refetch: refetchDetail } =
    useTransactionDetail(selectedTransactionId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  // ✅ Caja abierta se decide con la caja real del día
  const isCashBoxOpen = todayCashBox?.status === 'Open';



  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <InfoBar title="POS - PUNTO DE VENTA" />

          {cashBoxError && (
      <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-600">Error caja: {cashBoxError.message}</p>
      </div>
    )}


      {!isCashBoxLoading && !isCashBoxOpen && !cashBoxError && (
        <div className="mt-4 rounded-md bg-yellow-50 border border-yellow-200 p-4">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-sm font-medium text-yellow-800">
              No hay caja abierta. Abre una caja en{' '}
              <a href="/facturacion/caja-diaria" className="underline hover:no-underline">
                Caja Diaria
              </a>{' '}
              para empezar a trabajar.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_400px] gap-4 min-h-0">
        <aside className="hidden lg:block overflow-y-auto">
          <CashBoxStatusPanel summary={summary} isLoading={isCashBoxLoading} />
        </aside>

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

        <aside className="hidden lg:block overflow-y-auto">
          <TransactionDetailPanel
            detail={detail}
            isLoading={isDetailLoading}
            onRefresh={handleDetailChange}
          />
        </aside>
      </div>

      <CreateTransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleTransactionCreated}
        cashBox={todayCashBox}   // ✅ ESTA ES LA PIEZA QUE FALTABA
      />
    </div>
  );
}
