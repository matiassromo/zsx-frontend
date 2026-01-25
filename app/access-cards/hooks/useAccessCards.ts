'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAccessCards } from '@/lib/api/access-cards';
import { getEntranceAccessCards } from '@/lib/api/entrance-access-cards';
import { getTransactions } from '@/lib/api/transactions';
import type { AccessCard, EntranceAccessCard, Client } from '@/lib/api/types';

export interface AccessCardWithUsage extends AccessCard {
  usedPasses: number;
  remainingPasses: number;
  lastUsedAt: string | null;
  isActive: boolean;
  entrances: EntranceAccessCard[];
  owner: Client | null;
}

interface UseAccessCardsReturn {
  accessCards: AccessCardWithUsage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  stats: {
    total: number;
    active: number;
    finished: number;
  };
}

const MAX_PASSES = 10;

export function useAccessCards(): UseAccessCardsReturn {
  const [accessCards, setAccessCards] = useState<AccessCardWithUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccessCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch access cards first (required), then fetch supplementary data
      // Use Promise.allSettled for optional data to prevent failures from blocking the main data
      const cards = await getAccessCards();

      const [entrancesResult, transactionsResult] = await Promise.allSettled([
        getEntranceAccessCards(),
        getTransactions(),
      ]);

      const entrances = entrancesResult.status === 'fulfilled' ? entrancesResult.value : [];
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];

      // Create a map of transactionId to client
      const transactionClientMap = transactions.reduce<Record<string, Client | null>>(
        (acc, transaction) => {
          acc[transaction.id] = transaction.client || null;
          return acc;
        },
        {}
      );

      // Group entrances by accessCardId
      const entrancesByCard = entrances.reduce<Record<string, EntranceAccessCard[]>>(
        (acc, entrance) => {
          if (!acc[entrance.accessCardId]) {
            acc[entrance.accessCardId] = [];
          }
          acc[entrance.accessCardId].push(entrance);
          return acc;
        },
        {}
      );

      // Combine cards with their usage data
      const cardsWithUsage: AccessCardWithUsage[] = cards.map((card) => {
        const cardEntrances = entrancesByCard[card.id] || [];
        const usedPasses = cardEntrances.length;
        const remainingPasses = MAX_PASSES - usedPasses;
        const isActive = remainingPasses > 0;

        // Find the most recent entrance
        const sortedEntrances = [...cardEntrances].sort(
          (a, b) => new Date(b.entranceDate).getTime() - new Date(a.entranceDate).getTime()
        );
        const lastUsedAt = sortedEntrances.length > 0 ? sortedEntrances[0].entranceDate : null;

        // Get the owner from the transaction
        const owner = card.transactionId ? transactionClientMap[card.transactionId] || null : null;

        return {
          ...card,
          usedPasses,
          remainingPasses,
          lastUsedAt,
          isActive,
          entrances: cardEntrances,
          owner,
        };
      });

      setAccessCards(cardsWithUsage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar tarjetas de acceso'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccessCards();
  }, [fetchAccessCards]);

  const stats = {
    total: accessCards.length,
    active: accessCards.filter((c) => c.isActive).length,
    finished: accessCards.filter((c) => !c.isActive).length,
  };

  return {
    accessCards,
    isLoading,
    error,
    refetch: fetchAccessCards,
    stats,
  };
}
