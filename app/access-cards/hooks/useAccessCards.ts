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
  stats: { total: number; active: number; finished: number };
}

const MAX_PASSES = 10;

function entranceSortKey(e: any) {
  // prefer entryTime if backend includes it; fallback to entranceDate
  return e?.entryTime
    ? new Date(e.entryTime).getTime()
    : e?.entranceDate
      ? new Date(e.entranceDate).getTime()
      : 0;
}

export function useAccessCards(): UseAccessCardsReturn {
  const [accessCards, setAccessCards] = useState<AccessCardWithUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAccessCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const cards = await getAccessCards();

      const [entrancesResult, transactionsResult] = await Promise.allSettled([
        getEntranceAccessCards(),
        getTransactions(),
      ]);

      const entrances = entrancesResult.status === 'fulfilled' ? entrancesResult.value : [];
      const transactions = transactionsResult.status === 'fulfilled' ? transactionsResult.value : [];

      const transactionClientMap = transactions.reduce<Record<string, Client | null>>((acc, t) => {
        acc[t.id] = t.client || null;
        return acc;
      }, {});

      const entrancesByCard = entrances.reduce<Record<string, EntranceAccessCard[]>>((acc, entrance) => {
        if (!acc[entrance.accessCardId]) acc[entrance.accessCardId] = [];
        acc[entrance.accessCardId].push(entrance);
        return acc;
      }, {});

      const cardsWithUsage: AccessCardWithUsage[] = cards.map((card) => {
        const cardEntrances = entrancesByCard[card.id] || [];

        // ✅ Tu backend ya maneja card.uses como "restantes"
        const remainingPasses = typeof card.uses === 'number' ? card.uses : 0;
        const usedPasses = Math.max(0, MAX_PASSES - remainingPasses);
        const isActive = remainingPasses > 0;

        const sortedEntrances = [...cardEntrances].sort((a: any, b: any) => entranceSortKey(b) - entranceSortKey(a));
        const lastUsedAt = sortedEntrances.length > 0 ? (sortedEntrances[0] as any).entryTime || sortedEntrances[0].entranceDate : null;

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

  return { accessCards, isLoading, error, refetch: fetchAccessCards, stats };
}
