'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '@/lib/api/transactions';
import { getTodayCashBox } from '@/lib/api/cash-boxes';
import type { Transaction, CashBox } from '@/lib/api/types';

interface UsePosTransactionsReturn {
  transactions: Transaction[];
  cashBox: CashBox | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePosTransactions(): UsePosTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cashBox, setCashBox] = useState<CashBox | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const todayCashBox = await getTodayCashBox();
      setCashBox(todayCashBox);

      if (todayCashBox) {
        const data = await getTransactions(todayCashBox.id);
        setTransactions(data);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar transacciones'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    transactions,
    cashBox,
    isLoading,
    error,
    refetch: fetchData,
  };
}
