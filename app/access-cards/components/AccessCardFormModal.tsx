'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { TransactionSearchCombobox } from '@/app/components/ui/TransactionSearchCombobox';
import { createAccessCard, updateAccessCard } from '@/lib/api/access-cards';
import type { AccessCardRequestDto } from '@/lib/api/types';
import type { AccessCardWithUsage } from '../hooks/useAccessCards';
import toast from 'react-hot-toast';

interface AccessCardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessCard?: AccessCardWithUsage;
}

const DEFAULT_PRICE = 55;

interface FormData {
  transactionId: string;
  total: number;
  uses: number;
}

const initialFormData: FormData = {
  transactionId: '',
  total: DEFAULT_PRICE,
  uses: 10,
};

export function AccessCardFormModal({
  isOpen,
  onClose,
  onSuccess,
  accessCard,
}: AccessCardFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!accessCard;

  useEffect(() => {
    if (isOpen) {
      if (accessCard) {
        setFormData({
          transactionId: accessCard.transactionId || '',
          total: accessCard.total,
          uses: accessCard.uses,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, accessCard]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!isEditMode && !formData.transactionId) {
      newErrors.transactionId = 'Debe seleccionar una transaccion';
    }

    if (formData.total === undefined || formData.total < 0) {
      newErrors.total = 'El precio debe ser un numero positivo';
    }

    if (formData.uses === undefined || formData.uses < 1 || formData.uses > 10) {
      newErrors.uses = 'Los pases deben ser entre 1 y 10';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const data: AccessCardRequestDto = {
        total: formData.total,
        uses: formData.uses,
        transactionId: formData.transactionId || null,
      };

      if (isEditMode && accessCard) {
        await updateAccessCard(accessCard.id, data);
        toast.success('Tarjeta actualizada correctamente');
      } else {
        await createAccessCard(data);
        toast.success('Tarjeta creada correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar tarjeta';
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
      title={isEditMode ? 'Editar Tarjeta de 10 Pases' : 'Nueva Tarjeta de 10 Pases'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEditMode && (
          <TransactionSearchCombobox
            value={formData.transactionId}
            onChange={(id) => handleChange('transactionId', id)}
            error={errors.transactionId}
            label="Transaccion (Cliente)"
            placeholder="Buscar transaccion abierta..."
            filterStatus="Open"
          />
        )}

        {isEditMode && accessCard?.owner && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <p className="text-sm text-gray-900 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              {accessCard.owner.name}
            </p>
          </div>
        )}

        <Input
          label="Precio ($)"
          type="number"
          min="0"
          step="0.01"
          value={formData.total.toString()}
          onChange={(e) => handleChange('total', Number(e.target.value))}
          error={errors.total}
          placeholder="55.00"
        />

        <Input
          label="Cantidad de Pases"
          type="number"
          min="1"
          max="10"
          value={formData.uses.toString()}
          onChange={(e) => handleChange('uses', Number(e.target.value))}
          error={errors.uses}
          placeholder="10"
          disabled={isEditMode}
        />

        {isEditMode && (
          <p className="text-xs text-gray-500">
            La cantidad de pases no se puede modificar una vez creada la tarjeta.
          </p>
        )}

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
