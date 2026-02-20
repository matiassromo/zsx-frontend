'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { TransactionSearchCombobox } from '@/app/components/ui/TransactionSearchCombobox';
import { createParking, updateParking } from '@/lib/api/parkings';
import type { ParkingRequestDto } from '@/lib/api/types';
import type { ParkingWithTransaction } from '../hooks/useParkings';
import toast from 'react-hot-toast';

interface ParkingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parking?: ParkingWithTransaction;
}

interface FormData {
  transactionId: string;
  entryTime: string;
  exitTime: string;
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
};

export function ParkingFormModal({
  isOpen,
  onClose,
  onSuccess,
  parking,
}: ParkingFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!parking;
  const showTransactionPicker = !isEditMode || !parking?.transactionId;

  useEffect(() => {
    if (isOpen) {
      if (parking) {
        setFormData({
          transactionId: parking.transactionId || '',
          entryTime: toInputDateTime(parking.entryTime),
          exitTime: toInputDateTime(parking.exitTime),
        });
      } else {
        setFormData({
          ...initialFormData,
          entryTime: getNowInputValue(),
        });
      }
      setErrors({});
    }
  }, [isOpen, parking]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.transactionId) {
      nextErrors.transactionId = 'Debe seleccionar una transacción';
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

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload: ParkingRequestDto = {
        transactionId: formData.transactionId,
        entryTime: toApiDateTime(formData.entryTime),
        exitTime: formData.exitTime ? toApiDateTime(formData.exitTime) : null,
      };

      if (isEditMode && parking) {
        await updateParking(parking.id, payload);
        toast.success('Parqueo actualizado correctamente');
      } else {
        await createParking(payload);
        toast.success('Parqueo creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar parqueo';
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
      title={isEditMode ? 'Editar Parqueo' : 'Nuevo Parqueo'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {showTransactionPicker && (
          <TransactionSearchCombobox
            value={formData.transactionId}
            onChange={(id) => handleChange('transactionId', id)}
            error={errors.transactionId}
            label="Transacción (Cliente)"
            placeholder="Buscar transacción abierta..."
            filterStatus="Open"
          />
        )}

        {isEditMode && !showTransactionPicker && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Transacción</label>
            <p className="text-sm text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {parking?.owner?.name || 'Sin cliente'}{' '}
              {parking?.transactionId ? `#${parking.transactionId.substring(0, 8)}` : ''}
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
