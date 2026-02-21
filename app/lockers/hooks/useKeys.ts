'use client';

import { useState, useEffect, useCallback } from 'react';
import { getKeys } from '@/lib/api/keys';
import { getTransactions } from '@/lib/api/transactions';
import type { Key } from '@/lib/api/types';

interface UseKeysReturn {
  keys: Key[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useKeys(): UseKeysReturn {
  const [keys, setKeys] = useState<Key[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [rawKeys, transactions] = await Promise.all([
        getKeys(),
        getTransactions(),
      ]);
      const txMap = new Map(transactions.map((t) => [t.id, t]));
      const enriched = rawKeys.map((k) => ({
        ...k,
        transaction: k.transactionId ? (txMap.get(k.transactionId) ?? null) : null,
      }));
      setKeys(enriched);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar llaves'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return {
    keys,
    isLoading,
    error,
    refetch: fetchKeys,
  };
}
