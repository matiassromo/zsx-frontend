'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTransactionDetail } from '@/lib/api/transactions';
import type { TransactionDetail } from '@/lib/api/types';

interface UseTransactionDetailReturn {
  detail: TransactionDetail | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
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
      const data = await getTransactionDetail(transactionId);
      setDetail(data);
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
