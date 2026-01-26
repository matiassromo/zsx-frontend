'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactions } from '@/lib/api/transactions';
import type { Transaction } from '@/lib/api/types';

interface UsePosTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePosTransactions(cashBoxId?: string | null): UsePosTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!cashBoxId) {
        setTransactions([]);
        return;
      }

      const data = await getTransactions(cashBoxId);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar transacciones'));
    } finally {
      setIsLoading(false);
    }
  }, [cashBoxId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchData,
  };
}
