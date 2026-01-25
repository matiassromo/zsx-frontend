'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactionDetail } from '@/lib/api/transactions';
import { getKeys } from '@/lib/api/keys';
import type { TransactionDetail, Key } from '@/lib/api/types';

interface UseTransactionDetailReturn {
  detail: TransactionDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function normId(v: unknown): string {
  return String(v ?? '').trim().toLowerCase();
}

function getKeyTransactionId(k: Key): string {
  const anyK = k as any;
  return (
    normId(k.transactionId) ||
    normId(anyK.transactionID) ||
    normId(k.transaction?.id) ||
    normId(anyK.transaction?.id) ||
    ''
  );
}

export function useTransactionDetail(transactionId: string | null): UseTransactionDetailReturn {
  const [detail, setDetail] = useState<TransactionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!transactionId) {
      setDetail(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const [data, allKeys] = await Promise.all([
        getTransactionDetail(transactionId),
        getKeys(),
      ]);

      const tid = normId(transactionId);

      // Siempre recalcular keys desde /api/Keys (fuente de verdad)
      const resolvedKeys = (allKeys || []).filter((k) => getKeyTransactionId(k) === tid);

      setDetail({
        ...data,
        keys: resolvedKeys,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar detalle'));
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return {
    detail,
    isLoading,
    error,
    refetch: fetchDetail,
  };
}
