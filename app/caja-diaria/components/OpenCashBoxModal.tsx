'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { openCashBox } from '@/lib/api/cash-boxes';

interface OpenCashBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OpenCashBoxModal({ isOpen, onClose, onSuccess }: OpenCashBoxModalProps) {
  const [openingBalance, setOpeningBalance] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const balance = parseFloat(openingBalance);
    if (isNaN(balance) || balance < 0) {
      setError('Ingrese un monto válido');
      return;
    }

    try {
      setIsLoading(true);
      await openCashBox({ openingBalance: balance });
      setOpeningBalance('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al abrir la caja');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setOpeningBalance('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Abrir Caja" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Caja Inicial"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          error={error}
          required
        />
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
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 active:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
                Abriendo...
              </span>
            ) : (
              'Abrir Caja'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
