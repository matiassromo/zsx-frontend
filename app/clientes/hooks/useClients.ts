'use client';

import { useState, useEffect, useCallback } from 'react';
import { getClients } from '@/lib/api/clients';
import type { Client } from '@/lib/api/types';

interface UseClientsReturn {
  clients: Client[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getClients();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al cargar clientes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients,
  };
}
