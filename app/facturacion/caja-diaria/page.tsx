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
import { ManualCashMovementModal, ManualMovementKind } from './components/ManualCashMovementModal';
import { ManualMovementsHistory } from './components/ManualMovementsHistory';



export default function CajaDiariaPage() {
  const { cashBox, summary, isLoading, error, refetch } = useCashBox();
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [reopenError, setReopenError] = useState('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualKind, setManualKind] = useState<ManualMovementKind>('Ingreso');

  

  const handleOpenSuccess = () => refetch();
  const handleCloseSuccess = () => refetch();

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

  const status = cashBox?.status ?? null;

  // Debug - eliminar después de arreglar
  console.log('Debug:', { isLoading, cashBox, status, summary, error });

  return (  
    <div className="space-y-6">
      <InfoBar title="CAJA DIARIA" />

      {/* Status header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <StatusChip status={status} />

      <div className="flex items-center gap-3">
        {/* Abrir caja si no hay caja o está cerrada */}
        {(status === null || status === 'Closed') && (
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-600"
          >
            Abrir Caja
          </button>
        )}

        {/* Exportar PDF solo cuando esté cerrada */}
        {status === 'Closed' && summary && (
          <ExportPdfButton reportElementId="daily-report" />
        )}
      </div>
    </div>


      {/* Error display */}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">Error: {error.message}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-gray-500">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>Cargando...</span>
          </div>
        </div>
      )}

      {/* Debug info - eliminar después */}
      {!isLoading && (
        <div className="bg-yellow-50 border border-yellow-200 p-2 text-xs font-mono">
          Estado: {status} | CashBox: {cashBox ? 'Sí' : 'No'} | Summary: {summary ? 'Sí' : 'No'}
        </div>
      )}

      {/* State A: No CashBox */}
      {!isLoading && !cashBox && (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">No hay caja abierta</h2>
          <p className="text-gray-500 text-center mb-6 max-w-sm">
            Inicie el día abriendo una nueva caja con el monto inicial disponible.
          </p>
          <button
            onClick={() => setIsOpenModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-md bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600"
          >
            Abrir Caja
          </button>
        </div>
      )}

      {/* State B: CashBox is Open - CORREGIDO: mostrar incluso sin summary inicial */}
      {!isLoading && cashBox && status === 'Open' && (
        <div className="space-y-6">
          {summary ? (
            <CashBoxMetrics summary={summary} />
          ) : (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
              Cargando métricas...
            </div>
          )}

          {summary && (
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => { setManualKind('Ingreso'); setManualModalOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-600"
            >
              + Ingreso
            </button>

            <button
              onClick={() => { setManualKind('Egreso'); setManualModalOpen(true); }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-600"
            >
              + Egreso
            </button>
          </div>
        )}

          
          {/* Transaction counts - solo si hay summary */}
          {summary && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{summary.closedTransactions}</span> transacciones cerradas,{' '}
                  <span className="font-medium text-yellow-600">{summary.openTransactions}</span> abiertas
                </div>
                <div className="text-xs text-gray-400">Actualización automática cada 30s</div>
              </div>
            </div>
          )}

                    {summary && (
            <ManualMovementsHistory movements={(summary as any).manualMovements ?? []} />
          )}


          <div className="flex justify-end">
            <button
              onClick={() => setIsCloseDialogOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600"
            >
              Cerrar Caja
            </button>
          </div>
        </div>
      )}

      {/* State C: CashBox is Closed */}
      {!isLoading && cashBox && status === 'Closed' && summary && (
        <div className="space-y-6">
          <div id="daily-report">
            <DailyReportCard summary={summary} />
          </div>
          {reopenError && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{reopenError}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleReopen}
              disabled={isReopening}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-6 py-3 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              {isReopening ? 'Reabriendo...' : 'Reabrir Caja'}
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

      {cashBox && status === 'Open' && summary && (
        <ManualCashMovementModal
          isOpen={manualModalOpen}
          onClose={() => setManualModalOpen(false)}
          cashBoxId={cashBox.id}
          kind={manualKind}
          maxAmount={
            manualKind === 'Egreso'
              ? (summary.cashBox.openingBalance + (summary.totalPayments ?? 0) - ((summary as any).manualExpense ?? 0))
              : undefined
          }
          onSuccess={refetch}
        />
      )}

    </div>
  );
}