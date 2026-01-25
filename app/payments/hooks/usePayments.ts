'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPayments } from '@/lib/api/payments';
import { getTransactions } from '@/lib/api/transactions';
import type { Payment, Transaction, Client } from '@/lib/api/types';

export interface PaymentWithTransaction extends Payment {
  transaction?: Transaction | null;
  client?: Client | null;
}

interface UsePaymentsReturn {
  payments: PaymentWithTransaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePayments(): UsePaymentsReturn {
  const [payments, setPayments] = useState<PaymentWithTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const paymentsData = await getPayments();
      const transactionsResult = await Promise.allSettled([getTransactions()]);
      const transactions =
        transactionsResult[0].status === 'fulfilled' ? transactionsResult[0].value : [];

      const transactionMap = transactions.reduce<Record<string, Transaction>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const mapped = paymentsData.map((payment) => {
        const transaction = payment.transactionId
          ? transactionMap[payment.transactionId]
          : undefined;
        return {
          ...payment,
          transaction,
          client: transaction?.client || null,
        };
      });

      mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPayments(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar pagos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    payments,
    isLoading,
    error,
    refetch: fetchPayments,
  };
}
