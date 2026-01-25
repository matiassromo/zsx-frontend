'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { TransactionSearchCombobox } from '@/app/components/ui/TransactionSearchCombobox';
import {
  createEntranceTransaction,
  updateEntranceTransaction,
} from '@/lib/api/entrance-transactions';
import type { EntranceTransactionRequestDto } from '@/lib/api/types';
import type { EntranceTransactionWithTransaction } from '../hooks/useEntranceTransactions';
import toast from 'react-hot-toast';

interface EntranceTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  entranceTransaction?: EntranceTransactionWithTransaction;
}

interface FormData {
  transactionId: string;
  entryTime: string;
  exitTime: string;
  numberAdults: number;
  numberChildren: number;
  numberSeniors: number;
  numberDisabled: number;
}

function toInputDateTime(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function toApiDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

function getNowInputValue(): string {
  return toInputDateTime(new Date().toISOString());
}

const initialFormData: FormData = {
  transactionId: '',
  entryTime: '',
  exitTime: '',
  numberAdults: 0,
  numberChildren: 0,
  numberSeniors: 0,
  numberDisabled: 0,
};

export function EntranceTransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
  entranceTransaction,
}: EntranceTransactionFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!entranceTransaction;
  const showTransactionPicker = !isEditMode || !entranceTransaction?.transactionId;

  useEffect(() => {
    if (isOpen) {
      if (entranceTransaction) {
        setFormData({
          transactionId: entranceTransaction.transactionId || '',
          entryTime: toInputDateTime(entranceTransaction.entryTime),
          exitTime: toInputDateTime(entranceTransaction.exitTime),
          numberAdults: entranceTransaction.numberAdults ?? 0,
          numberChildren: entranceTransaction.numberChildren ?? 0,
          numberSeniors: entranceTransaction.numberSeniors ?? 0,
          numberDisabled: entranceTransaction.numberDisabled ?? 0,
        });
      } else {
        setFormData({
          ...initialFormData,
          entryTime: getNowInputValue(),
        });
      }
      setErrors({});
    }
  }, [isOpen, entranceTransaction]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.transactionId) {
      nextErrors.transactionId = 'Debe seleccionar una transaccion';
    }

    if (!formData.entryTime) {
      nextErrors.entryTime = 'La hora de entrada es requerida';
    }

    if (formData.entryTime && formData.exitTime) {
      const entry = new Date(formData.entryTime);
      const exit = new Date(formData.exitTime);
      if (exit.getTime() < entry.getTime()) {
        nextErrors.exitTime = 'La hora de salida debe ser posterior a la entrada';
      }
    }

    const counts = [
      { key: 'numberAdults', label: 'Adultos' },
      { key: 'numberChildren', label: 'Ninos' },
      { key: 'numberSeniors', label: 'Seniors' },
      { key: 'numberDisabled', label: 'Discapacidad' },
    ] as const;

    counts.forEach(({ key, label }) => {
      const value = formData[key];
      if (Number.isNaN(value) || value < 0) {
        nextErrors[key] = `${label} debe ser un numero mayor o igual a 0`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: EntranceTransactionRequestDto = {
        transactionId: formData.transactionId,
        entryTime: toApiDateTime(formData.entryTime),
        exitTime: formData.exitTime ? toApiDateTime(formData.exitTime) : null,
        numberAdults: formData.numberAdults,
        numberChildren: formData.numberChildren,
        numberSeniors: formData.numberSeniors,
        numberDisabled: formData.numberDisabled,
      };

      if (isEditMode && entranceTransaction) {
        await updateEntranceTransaction(entranceTransaction.id, payload);
        toast.success('Entrada actualizada correctamente');
      } else {
        await createEntranceTransaction(payload);
        toast.success('Entrada creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar entrada';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string | number) => {
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
      title={isEditMode ? 'Editar Entrada' : 'Nueva Entrada'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {showTransactionPicker && (
          <TransactionSearchCombobox
            value={formData.transactionId}
            onChange={(id) => handleChange('transactionId', id)}
            error={errors.transactionId}
            label="Transaccion (Cliente)"
            placeholder="Buscar transaccion abierta..."
            filterStatus="Open"
          />
        )}

        {isEditMode && !showTransactionPicker && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Transaccion</label>
            <p className="text-sm text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {entranceTransaction?.owner?.name || 'Sin cliente'}{' '}
              {entranceTransaction?.transactionId
                ? `#${entranceTransaction.transactionId.substring(0, 8)}`
                : ''}
            </p>
          </div>
        )}

        <Input
          label="Hora de entrada"
          type="datetime-local"
          value={formData.entryTime}
          onChange={(e) => handleChange('entryTime', e.target.value)}
          error={errors.entryTime}
          required
        />

        <Input
          label="Hora de salida"
          type="datetime-local"
          value={formData.exitTime}
          onChange={(e) => handleChange('exitTime', e.target.value)}
          error={errors.exitTime}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Adultos"
            type="number"
            min="0"
            value={formData.numberAdults.toString()}
            onChange={(e) => handleChange('numberAdults', Number(e.target.value))}
            error={errors.numberAdults}
          />
          <Input
            label="Ninos"
            type="number"
            min="0"
            value={formData.numberChildren.toString()}
            onChange={(e) => handleChange('numberChildren', Number(e.target.value))}
            error={errors.numberChildren}
          />
          <Input
            label="Seniors"
            type="number"
            min="0"
            value={formData.numberSeniors.toString()}
            onChange={(e) => handleChange('numberSeniors', Number(e.target.value))}
            error={errors.numberSeniors}
          />
          <Input
            label="Discapacidad"
            type="number"
            min="0"
            value={formData.numberDisabled.toString()}
            onChange={(e) => handleChange('numberDisabled', Number(e.target.value))}
            error={errors.numberDisabled}
          />
        </div>

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
