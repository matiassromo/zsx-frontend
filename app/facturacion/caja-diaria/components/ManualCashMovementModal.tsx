'use client';

import { useMemo, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import type { PaymentType } from '@/lib/api/types';

export type ManualMovementKind = 'Ingreso' | 'Egreso';

export interface CashBoxManualMovement {
  id: string;
  cashBoxId: string;
  kind: ManualMovementKind;
  amount: number;
  paymentType: PaymentType; // "Efectivo" | "Transferencia"
  concept: string;
  createdAt: string; // ISO
}

const storageKey = (cashBoxId: string) => `zs:cashbox_manual_movements:${cashBoxId}`;

function readMovements(cashBoxId: string): CashBoxManualMovement[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(cashBoxId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CashBoxManualMovement[];
  } catch {
    return [];
  }
}

function writeMovements(cashBoxId: string, items: CashBoxManualMovement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(storageKey(cashBoxId), JSON.stringify(items));
}

function uid() {
  return (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).toString();
}

interface ManualCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBoxId: string;
  kind: ManualMovementKind;
  maxAmount?: number; // para egresos (validación)
  onSuccess: () => void;
}

export function ManualCashMovementModal({
  isOpen,
  onClose,
  cashBoxId,
  kind,
  maxAmount,
  onSuccess,
}: ManualCashMovementModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Efectivo');
  const [concept, setConcept] = useState('');
  const [error, setError] = useState('');

  const title = useMemo(() => (kind === 'Ingreso' ? 'Agregar Ingreso Manual' : 'Agregar Egreso Manual'), [kind]);

  const reset = () => {
    setAmount('');
    setPaymentType('Efectivo');
    setConcept('');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (Number.isNaN(val) || val <= 0) {
      setError('Ingrese un monto válido (> 0)');
      return;
    }

    if (kind === 'Egreso' && typeof maxAmount === 'number' && val > maxAmount) {
      setError('El egreso no puede ser mayor que la caja actual');
      return;
    }

    if (!concept.trim()) {
      setError('Ingrese un concepto/motivo');
      return;
    }

    const items = readMovements(cashBoxId);

    const movement: CashBoxManualMovement = {
      id: uid(),
      cashBoxId,
      kind,
      amount: val,
      paymentType,
      concept: concept.trim(),
      createdAt: new Date().toISOString(),
    };

    writeMovements(cashBoxId, [movement, ...items]);

    onSuccess();
    handleClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Monto"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Método</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value as PaymentType)}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Concepto / Motivo</label>
          <textarea
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            rows={3}
            placeholder="Ej: Cambio inicial, compra insumos, retiro, ajuste…"
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              kind === 'Ingreso'
                ? 'bg-green-500 hover:bg-green-600 active:bg-green-700'
                : 'bg-red-500 hover:bg-red-600 active:bg-red-700'
            }`}
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
