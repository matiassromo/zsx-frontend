'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { closeCashBox } from '@/lib/api/cash-boxes';
import type { CashBoxSummary } from '@/lib/api/types';
import { formatCurrency } from '../utils/formatCurrency';

interface CloseCashBoxDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  summary: CashBoxSummary | null;
}

export function CloseCashBoxDialog({
  isOpen,
  onClose,
  onSuccess,
  summary,
}: CloseCashBoxDialogProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!summary) return null;

  const { cashBox, totalPayments } = summary;
  const currentBalance = cashBox.openingBalance + totalPayments;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError('');
      await closeCashBox(cashBox.id, { notes: notes || null });
      setNotes('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cerrar la caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cerrar Caja" size="sm">
      <div className="space-y-4">
        <div className="rounded-lg bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Caja Inicial:</span>
            <span className="font-medium">{formatCurrency(cashBox.openingBalance)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Ingresos Totales:</span>
            <span className="font-medium text-green-600">+{formatCurrency(totalPayments)}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-medium text-gray-900">Caja de Cierre:</span>
            <span className="font-bold text-lg text-blue-600">{formatCurrency(currentBalance)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Agregar notas sobre el cierre..."
            rows={3}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
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
                Cerrando...
              </span>
            ) : (
              'Cerrar Caja'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
