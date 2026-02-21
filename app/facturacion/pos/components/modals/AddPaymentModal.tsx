'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Select } from '@/app/components/ui/Select';
import { createPayment } from '@/lib/api/payments';
import type { PaymentType } from '@/lib/api/types';

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  pendingBalance: number;
  onSuccess: () => Promise<void>;
}

function fmt(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function AddPaymentModal({
  isOpen,
  onClose,
  transactionId,
  pendingBalance,
  onSuccess,
}: AddPaymentModalProps) {
  const [rawInput, setRawInput] = useState('');
  const [type, setType] = useState<PaymentType>('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset fields every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setRawInput('');
      setType('Efectivo');
      setError('');
    }
  }, [isOpen]);

  const total = parseFloat(rawInput) || 0;
  const remaining = Math.max(0, pendingBalance - total);
  const coversAll = total >= pendingBalance && pendingBalance > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (total <= 0) {
      setError('Ingrese un monto mayor a $0.00');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await createPayment({ transactionId, total, type });
      new BroadcastChannel('zs-events').postMessage({ type: 'payment:created' });
      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Pending balance summary */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-amber-800">Saldo pendiente</span>
            <span className="text-base font-bold text-amber-900">{fmt(pendingBalance)}</span>
          </div>
        </div>

        {/* Payment type */}
        <Select
          label="Tipo de pago"
          value={type}
          onChange={(e) => setType(e.target.value as PaymentType)}
          options={[
            { value: 'Efectivo', label: 'Efectivo' },
            { value: 'Transferencia', label: 'Transferencia' },
          ]}
        />

        {/* Amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto a cobrar ($)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0.01}
              step={0.01}
              placeholder="0.00"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setRawInput(String(pendingBalance))}
              className="shrink-0 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Saldo completo
            </button>
          </div>

          {/* Live feedback */}
          {total > 0 && (
            <div className="mt-1.5">
              {coversAll ? (
                <p className="text-xs font-medium text-emerald-600">
                  ✓ Cubre el saldo completo — quedará en $0.00
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Pendiente después de este pago:{' '}
                  <strong className="text-slate-700">{fmt(remaining)}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || total <= 0}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Registrando...' : `Cobrar ${total > 0 ? fmt(total) : '—'}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
