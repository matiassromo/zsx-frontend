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

function money(n: number) {
  return (n ?? 0).toLocaleString('es-EC', { style: 'currency', currency: 'USD' });
}

export default function PosPage() {
  // ✅ Fuente de verdad: Caja Diaria
  const {
    cashBox: todayCashBox,
    summary,
    isLoading: isCashBoxLoading,
    error: cashBoxError,
    refetch: refetchCashBox,
  } = useCashBox();

  // ✅ Lista de transacciones
  const {
    transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = usePosTransactions(todayCashBox?.id);

  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const { detail, isLoading: isDetailLoading, refetch: refetchDetail } =
    useTransactionDetail(selectedTransactionId);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Navegación mobile: 'list' = ver lista, 'detail' = ver detalle
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const handleTransactionCreated = async () => {
    await refetchTransactions();
    await refetchCashBox();
  };

  const handleSelectTransaction = (id: string) => {
    setSelectedTransactionId(id);
    setMobileView('detail'); // en mobile, cambia automáticamente al detalle
  };

  const handleDetailChange = async () => {
    await refetchDetail();
    await refetchTransactions();
    await refetchCashBox();
  };

  const isCashBoxOpen = todayCashBox?.status === 'Open';

  return (
    <div className="h-[calc(100vh-5.5rem)] md:h-[calc(100vh-2.5rem)] flex flex-col">
      <InfoBar title="POS - PUNTO DE VENTA" />

      {cashBoxError && (
        <div className="mt-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">Error caja: {cashBoxError.message}</p>
        </div>
      )}

      {!isCashBoxLoading && !isCashBoxOpen && !cashBoxError && (
        <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 flex items-center gap-2">
          <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-amber-800">
            No hay caja abierta.{' '}
            <a href="/facturacion/caja-diaria" className="underline hover:no-underline">
              Abrir en Caja Diaria →
            </a>
          </p>
        </div>
      )}

      {/* Barra de resumen de caja – solo mobile */}
      {!isCashBoxLoading && summary && (
        <div className="lg:hidden mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${isCashBoxOpen ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span className="font-semibold text-slate-700">
              {isCashBoxOpen ? 'Caja abierta' : 'Caja cerrada'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Ingresos:{' '}
              <span className="font-semibold text-slate-800">{money(summary.totalPayments)}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span>
              Abiertas:{' '}
              <span className="font-semibold text-amber-600">{summary.openTransactions}</span>
            </span>
          </div>
        </div>
      )}

      {/* Layout principal: 3 columnas en desktop, 1 en mobile */}
      <div className="mt-3 flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr_400px] gap-4 min-h-0">

        {/* Panel izquierdo: Caja – solo desktop */}
        <aside className="hidden lg:block overflow-y-auto">
          <CashBoxStatusPanel summary={summary} isLoading={isCashBoxLoading} />
        </aside>

        {/* Centro: Lista de transacciones – en mobile se oculta cuando se ve el detalle */}
        <main className={`overflow-y-auto ${mobileView === 'detail' ? 'hidden lg:block' : ''}`}>
          <TransactionsList
            transactions={transactions}
            isLoading={isTransactionsLoading}
            selectedId={selectedTransactionId}
            onSelect={handleSelectTransaction}
            onCreateNew={() => setIsCreateModalOpen(true)}
            isCashBoxOpen={isCashBoxOpen}
          />
        </main>

        {/* Panel derecho: Detalle – en mobile se oculta cuando se ve la lista */}
        <aside className={`overflow-y-auto ${mobileView === 'list' ? 'hidden lg:block' : ''}`}>
          {/* Botón volver – solo mobile */}
          <button
            onClick={() => { setMobileView('list'); setSelectedTransactionId(null); }}
            className="lg:hidden mb-3 flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la lista
          </button>

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
        cashBox={todayCashBox}
      />
    </div>
  );
}
