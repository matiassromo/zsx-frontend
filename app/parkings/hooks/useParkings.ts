'use client';

import { useState, useEffect, useCallback } from 'react';
import { getParkings } from '@/lib/api/parkings';
import { getTransactions } from '@/lib/api/transactions';
import type { Parking, Transaction, Client } from '@/lib/api/types';

export interface ParkingWithTransaction extends Parking {
  transaction?: Transaction | null;
  owner?: Client | null;
}

interface UseParkingsReturn {
  parkings: ParkingWithTransaction[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useParkings(): UseParkingsReturn {
  const [parkings, setParkings] = useState<ParkingWithTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchParkings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const parkingsData = await getParkings();
      const transactionsResult = await Promise.allSettled([getTransactions()]);
      const transactions =
        transactionsResult[0].status === 'fulfilled' ? transactionsResult[0].value : [];

      const transactionMap = transactions.reduce<Record<string, Transaction>>((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});

      const mapped = parkingsData.map((parking) => {
        const transaction = parking.transactionId
          ? transactionMap[parking.transactionId]
          : undefined;
        return {
          ...parking,
          transaction,
          owner: transaction?.client || null,
        };
      });

      mapped.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime());
      setParkings(mapped);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar parqueos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParkings();
  }, [fetchParkings]);

  return {
    parkings,
    isLoading,
    error,
    refetch: fetchParkings,
  };
}
