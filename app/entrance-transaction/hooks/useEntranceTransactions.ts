'use client';

import { useState, useEffect, useCallback } from 'react';
import { getEntranceTransactions } from '@/lib/api/entrance-transactions';
import { getTransactions } from '@/lib/api/transactions';
import type { EntranceTransaction, Transaction, Client } from '@/lib/api/types';

export interface EntranceTransactionWithTransaction extends EntranceTransaction {
  transaction?: Transaction | null;
  owner?: Client | null;
}

interface UseEntranceTransactionsReturn {
  entranceTransactions: EntranceTransactionWithTransaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useEntranceTransactions(): UseEntranceTransactionsReturn {
  const [entranceTransactions, setEntranceTransactions] = useState<
    EntranceTransactionWithTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntranceTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const entranceTransactionsData = await getEntranceTransactions();
      const transactionsResult = await Promise.allSettled([getTransactions()]);
      const transactions =
        transactionsResult[0].status === 'fulfilled' ? transactionsResult[0].value : [];

      const transactionMap = transactions.reduce<Record<string, Transaction>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const mapped = entranceTransactionsData.map((entranceTransaction) => {
        const transaction = entranceTransaction.transactionId
          ? transactionMap[entranceTransaction.transactionId]
          : undefined;
        return {
          ...entranceTransaction,
          transaction,
          owner: transaction?.client || null,
        };
      });

      mapped.sort(
        (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
      );
      setEntranceTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar entradas'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntranceTransactions();
  }, [fetchEntranceTransactions]);

  return {
    entranceTransactions,
    isLoading,
    error,
    refetch: fetchEntranceTransactions,
  };
}
