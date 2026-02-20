'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { TransactionSearchCombobox } from '@/app/components/ui/TransactionSearchCombobox';
import { createPayment, updatePayment } from '@/lib/api/payments';
import type { PaymentRequestDto, PaymentType } from '@/lib/api/types';
import type { PaymentWithTransaction } from '../hooks/usePayments';
import toast from 'react-hot-toast';

interface PaymentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment?: PaymentWithTransaction;
}

interface FormData {
  transactionId: string;
  total: string;
  type: PaymentType;
}

const initialFormData: FormData = {
  transactionId: '',
  total: '',
  type: 'Efectivo',
};

const paymentTypeOptions = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Transferencia', label: 'Transferencia' },
];

export function PaymentFormModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: PaymentFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!payment;

  useEffect(() => {
    if (isOpen) {
      if (payment) {
        setFormData({
          transactionId: payment.transactionId || '',
          total: payment.total.toString(),
          type: payment.type,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, payment]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.transactionId) {
      nextErrors.transactionId = 'Debe seleccionar una transacción';
    }

    const totalNum = parseFloat(formData.total);
    if (!formData.total || isNaN(totalNum)) {
      nextErrors.total = 'El total es requerido';
    } else if (totalNum <= 0) {
      nextErrors.total = 'El total debe ser mayor a 0';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: PaymentRequestDto = {
        transactionId: formData.transactionId,
        total: parseFloat(formData.total),
        type: formData.type,
      };

      if (isEditMode && payment) {
        await updatePayment(payment.id, payload);
        new BroadcastChannel("zs-events").postMessage({ type: "payment:updated" });
        toast.success('Pago actualizado correctamente');
      } else {
        await createPayment(payload);
        new BroadcastChannel("zs-events").postMessage({ type: "payment:created" });
        toast.success('Pago creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar pago';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Pago' : 'Nuevo Pago'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode ? (
          <TransactionSearchCombobox
            value={formData.transactionId}
            onChange={(id) => handleChange('transactionId', id)}
            error={errors.transactionId}
            label="Transacción (Cliente)"
            placeholder="Buscar transacción abierta..."
            filterStatus="Open"
          />
        ) : (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Transacción</label>
            <p className="text-sm text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {payment?.client?.name || 'Sin cliente'}{' '}
              {payment?.transactionId ? `#${payment.transactionId.substring(0, 8)}` : ''}
            </p>
          </div>
        )}

        <Input
          label="Total"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.total}
          onChange={(e) => handleChange('total', e.target.value)}
          error={errors.total}
          required
          placeholder="0.00"
        />

        <Select
          label="Tipo de Pago"
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value as PaymentType)}
          options={paymentTypeOptions}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
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
                Guardando...
              </span>
            ) : isEditMode ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
