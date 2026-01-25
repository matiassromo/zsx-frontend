'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { useCashBox } from './hooks/useCashBox';
import { StatusChip } from './components/StatusChip';
import { CashBoxMetrics } from './components/CashBoxMetrics';
import { DailyReportCard } from './components/DailyReportCard';
import { OpenCashBoxModal } from './components/OpenCashBoxModal';
import { CloseCashBoxDialog } from './components/CloseCashBoxDialog';
import { ExportPdfButton } from './components/ExportPdfButton';
import { reopenCashBox } from '@/lib/api/cash-boxes';

export default function CajaDiariaPage() {
  const { cashBox, summary, isLoading, refetch } = useCashBox();
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [reopenError, setReopenError] = useState('');

  const handleOpenSuccess = () => {
    refetch();
  };

  const handleCloseSuccess = () => {
    refetch();
  };

  const handleReopen = async () => {
    if (!cashBox) return;

    try {
      setIsReopening(true);
      setReopenError('');
      await reopenCashBox(cashBox.id);
      refetch();
    } catch (err) {
      setReopenError(err instanceof Error ? err.message : 'Error al reabrir la caja');
    } finally {
      setIsReopening(false);
    }
  };

  // Determine the current state
  const status = cashBox?.status ?? null;

  return (
    <div className="space-y-6">
      <InfoBar title="CAJA DIARIA" />

      {/* Status header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusChip status={status} />

        {/* Action buttons based on state */}
        <div className="flex items-center gap-3">
          {status === 'Closed' && summary && (
            <ExportPdfButton reportElementId="daily-report" />
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </div>
        </div>
      )}

      {/* State A: No CashBox exists for today */}
      {!isLoading && !cashBox && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No hay caja abierta</h2>
          <p className="text-gray-500 text-center mb-6 max-w-sm">
            Inicie el día abriendo una nueva caja con el monto inicial disponible.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-green-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-600 active:bg-green-700"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Abrir Caja
          </button>
        </div>
      )}

      {/* State B: CashBox is Open */}
      {!isLoading && cashBox && status === 'Open' && summary && (
        <div className="space-y-6">
          <CashBoxMetrics summary={summary} />

          {/* Transaction counts */}
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{summary.closedTransactions}</span> transacciones cerradas,{' '}
                <span className="font-medium text-yellow-600">{summary.openTransactions}</span> abiertas
              </div>
              <div className="text-xs text-gray-400">
                Actualización automática cada 30s
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsCloseDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-600 active:bg-red-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              Cerrar Caja
            </button>
          </div>
        </div>
      )}

      {/* State C: CashBox is Closed */}
      {!isLoading && cashBox && status === 'Closed' && summary && (
        <div className="space-y-6">
          <DailyReportCard summary={summary} />

          {/* Error message */}
          {reopenError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{reopenError}</p>
            </div>
          )}

          {/* Reopen button */}
          <div className="flex justify-end">
            <button
              onClick={handleReopen}
              disabled={isReopening}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-yellow-600 active:bg-yellow-700 disabled:opacity-50"
            >
              {isReopening ? (
                <>
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Reabriendo...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                    />
                  </svg>
                  Reabrir Caja
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <OpenCashBoxModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        onSuccess={handleOpenSuccess}
      />

      <CloseCashBoxDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        onSuccess={handleCloseSuccess}
        summary={summary}
      />
    </div>
  );
}
