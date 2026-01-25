'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { createEntranceAccessCard } from '@/lib/api/entrance-access-cards';
import type { AccessCardWithUsage } from '../hooks/useAccessCards';
import toast from 'react-hot-toast';

interface UsePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accessCard: AccessCardWithUsage | null;
}

const MAX_PASSES = 10;

export function UsePassModal({ isOpen, onClose, onSuccess, accessCard }: UsePassModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const remainingPasses = accessCard ? MAX_PASSES - accessCard.usedPasses : 0;

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setError('');
    }
  }, [isOpen]);

  const validate = (): boolean => {
    if (quantity < 1) {
      setError('Debe usar al menos 1 pase');
      return false;
    }
    if (quantity > remainingPasses) {
      setError(`Solo quedan ${remainingPasses} pases disponibles`);
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCard || !validate()) return;

    setIsSubmitting(true);

    try {
      // Create multiple entrance access cards based on quantity
      const now = new Date();
      const entranceDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const entranceEntryTime = now.toTimeString().split(' ')[0].substring(0, 8); // HH:mm:ss

      const promises = Array.from({ length: quantity }, () =>
        createEntranceAccessCard({
          accessCardId: accessCard.id,
          entranceDate,
          entranceEntryTime,
          entranceExitTime: null,
        })
      );

      await Promise.all(promises);

      toast.success(
        quantity === 1 ? 'Pase utilizado correctamente' : `${quantity} pases utilizados correctamente`
      );
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al usar pase';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setQuantity(num);
      if (error) setError('');
    }
  };

  if (!accessCard) return null;

  const cardId = `#${accessCard.id.substring(0, 8)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Usar Pases" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Tarjeta:</span>
            <span className="font-medium text-gray-900">{cardId}</span>
          </div>
          {accessCard.owner && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Cliente:</span>
              <span className="font-medium text-gray-900">{accessCard.owner.name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pases usados:</span>
            <span className="font-medium text-gray-900">
              {accessCard.usedPasses} / {MAX_PASSES}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pases disponibles:</span>
            <span className="font-medium text-green-600">{remainingPasses}</span>
          </div>
        </div>

        <Input
          label="Cantidad de pases a usar"
          type="number"
          min="1"
          max={remainingPasses}
          value={quantity.toString()}
          onChange={(e) => handleQuantityChange(e.target.value)}
          error={error}
        />

        {remainingPasses === 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Esta tarjeta no tiene pases disponibles.
            </p>
          </div>
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
            disabled={isSubmitting || remainingPasses === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
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
                Procesando...
              </span>
            ) : (
              `Usar ${quantity} ${quantity === 1 ? 'pase' : 'pases'}`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
