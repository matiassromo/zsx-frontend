'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayCashBox, getCashBoxSummary } from '@/lib/api/cash-boxes';
import type { CashBox, CashBoxSummary, PaymentType } from '@/lib/api/types';
import type { CashBoxManualMovement } from '../components/ManualCashMovementModal';

interface UseCashBoxReturn {
  cashBox: CashBox | null;
  summary: (CashBoxSummary & {
    manualIncome: number;
    manualExpense: number;
    manualCashDelta: number;
    manualTransferDelta: number;
    manualMovements: CashBoxManualMovement[];
  }) | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const POLL_INTERVAL = 30000;

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

function computeManualTotals(items: CashBoxManualMovement[]) {
  let manualIncome = 0;
  let manualExpense = 0;
  let manualCashDelta = 0;
  let manualTransferDelta = 0;

  for (const m of items) {
    const sign = m.kind === 'Ingreso' ? 1 : -1;
    if (m.kind === 'Ingreso') manualIncome += m.amount;
    else manualExpense += m.amount;

    if (m.paymentType === 'Efectivo') manualCashDelta += sign * m.amount;
    else manualTransferDelta += sign * m.amount;
  }

  return { manualIncome, manualExpense, manualCashDelta, manualTransferDelta };
}

export function useCashBox(): UseCashBoxReturn {
  const [cashBox, setCashBox] = useState<CashBox | null>(null);
  const [summary, setSummary] = useState<UseCashBoxReturn['summary']>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);

      const todayCashBox = await getTodayCashBox();
      setCashBox(todayCashBox);

      if (todayCashBox) {
        const cashBoxSummary = await getCashBoxSummary(todayCashBox.id);

        if (cashBoxSummary) {
          const manualMovements = readMovements(todayCashBox.id);
          const { manualIncome, manualExpense, manualCashDelta, manualTransferDelta } =
            computeManualTotals(manualMovements);

          // Ajuste del summary (sin tocar backend)
          // - Ingresos: totalPayments + manualIncome
          // - Egresos: manualExpense (nuevo)
          // - Desglose efectivo/transfer: suma delta manual (puede bajar)
          const adjusted: UseCashBoxReturn['summary'] = {
            ...cashBoxSummary,
            totalPayments: (cashBoxSummary.totalPayments ?? 0) + manualIncome,
            cash: (cashBoxSummary.cash ?? 0) + manualCashDelta,
            transfer: (cashBoxSummary.transfer ?? 0) + manualTransferDelta,
            manualIncome,
            manualExpense,
            manualCashDelta,
            manualTransferDelta,
            manualMovements,
          };

          setSummary(adjusted);
        } else {
          setSummary(null);
        }
      } else {
        setSummary(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar la caja'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return {
    cashBox,
    summary,
    isLoading,
    error,
    refetch: fetchData,
  };
}
