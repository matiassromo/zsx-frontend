'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getTodayCashBox, getCashBoxSummary } from '@/lib/api/cash-boxes';
import type { CashBox, CashBoxSummary } from '@/lib/api/types';

interface UseCashBoxReturn {
  cashBox: CashBox | null;
  summary: CashBoxSummary | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function useCashBox(): UseCashBoxReturn {
  const [cashBox, setCashBox] = useState<CashBox | null>(null);
  const [summary, setSummary] = useState<CashBoxSummary | null>(null);
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
        setSummary(cashBoxSummary);
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

    // Set up polling for auto-refresh
    intervalRef.current = setInterval(() => {
      fetchData();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
