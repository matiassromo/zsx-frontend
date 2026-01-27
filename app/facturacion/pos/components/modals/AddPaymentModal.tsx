'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function AddPaymentModal({ isOpen, onClose, transactionId, pendingBalance, onSuccess }: AddPaymentModalProps) {
  const [total, setTotal] = useState(pendingBalance > 0 ? pendingBalance : 0);
  const [type, setType] = useState<PaymentType>('Efectivo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Update total when pending balance changes
  useState(() => {
    if (pendingBalance > 0) {
      setTotal(pendingBalance);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (total <= 0) {
      setError('Ingrese un monto valido');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await createPayment({
        transactionId,
        total,
        type,
      });

      new BroadcastChannel("zs-events").postMessage({ type: "payment:created" });

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTotal(pendingBalance > 0 ? pendingBalance : 0);
    setType('Efectivo');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-4">
        {pendingBalance > 0 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Saldo pendiente: <strong>{formatCurrency(pendingBalance)}</strong>
            </p>
          </div>
        )}

        <Input
          label="Monto ($)"
          type="number"
          min={0.01}
          step={0.01}
          value={total}
          onChange={(e) => setTotal(parseFloat(e.target.value) || 0)}
        />

        <Select
          label="Tipo de Pago"
          value={type}
          onChange={(e) => setType(e.target.value as PaymentType)}
          options={[
            { value: 'Efectivo', label: 'Efectivo' },
            { value: 'Transferencia', label: 'Transferencia' },
          ]}
        />

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || total <= 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Registrando...' : `Registrar Pago (${formatCurrency(total)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
