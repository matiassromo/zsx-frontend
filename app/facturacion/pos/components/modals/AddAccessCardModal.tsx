'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';

import { getAccessCards, createAccessCard } from '@/lib/api/access-cards';
import { getTransactions } from '@/lib/api/transactions';
import { createEntranceAccessCard } from '@/lib/api/entrance-access-cards';

import type { Client, AccessCard } from '@/lib/api/types';

type AnyClient = Client | null;

function norm(s: unknown) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function nowDateOnly() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function nowTimeOnly() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mi}:${ss}`;
}

interface AddAccessCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  client: AnyClient;
  onSuccess: () => Promise<void>;
}

type Mode = 'auto' | 'use_existing' | 'create_new';

interface ExistingCardDisplay extends AccessCard {
  shortCode?: string;
  code?: string;
}

export function AddAccessCardModal({
  isOpen,
  onClose,
  transactionId,
  client,
  onSuccess,
}: AddAccessCardModalProps) {
  const [mode, setMode] = useState<Mode>('auto');

  const [isLoadingCard, setIsLoadingCard] = useState(false);
  const [existingCard, setExistingCard] = useState<ExistingCardDisplay | null>(null);

  const [usesTotal, setUsesTotal] = useState(10);
  const [price, setPrice] = useState(55);
  const [usesToConsume, setUsesToConsume] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const clientKey = useMemo(() => {
    const id = client?.id ?? '';
    const name = client?.name ?? '';
    const doc = client?.documentNumber ?? '';
    return { id, name, doc };
  }, [client]);

  useEffect(() => {
    if (!isOpen) return;

    const run = async () => {
      setError('');
      setIsLoadingCard(true);
      setExistingCard(null);

      try {
        const [cards, transactions] = await Promise.all([getAccessCards(), getTransactions()]);

        const targetClientId = clientKey.id ? String(clientKey.id) : '';
        const targetDoc = norm(clientKey.doc);

        const txById = new Map<string, typeof transactions[number]>();
        for (const t of transactions) txById.set(String(t.id), t);

        const found = cards.find((c) => {
          const tx = c?.transactionId ? txById.get(String(c.transactionId)) : null;
          const txClientId = tx?.client?.id
            ? String(tx.client.id)
            : tx?.clientId
            ? String(tx.clientId)
            : '';
          const txDoc = norm(tx?.client?.documentNumber ?? '');

          return (targetClientId && txClientId === targetClientId) || (targetDoc && txDoc === targetDoc);
        }) || null;

        if (found) {
          setExistingCard(found);
          setMode('use_existing');
        } else {
          setMode('create_new');
        }
      } catch {
        setMode('create_new');
      } finally {
        setIsLoadingCard(false);
      }
    };

    run();
  }, [isOpen, clientKey.id, clientKey.doc]);

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;

    if (mode === 'use_existing') {
      return !!existingCard && usesToConsume > 0;
    }

    if (mode === 'create_new') {
      return usesTotal > 0 && price > 0;
    }

    return false;
  }, [mode, existingCard, usesToConsume, usesTotal, price, isSubmitting]);

  const handleClose = () => {
    setError('');
    setExistingCard(null);
    setMode('auto');
    setUsesTotal(10);
    setPrice(55);
    setUsesToConsume(1);
    onClose();
  };

  async function consumePasses(accessCardId: string, qty: number) {
    await createEntranceAccessCard({
      accessCardId,
      entranceDate: nowDateOnly(),
      entranceEntryTime: nowTimeOnly(),
      entranceExitTime: null,
      qty,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);

      if (mode === 'use_existing') {
        if (!existingCard?.id) throw new Error('No se encontró el ID de la tarjeta existente.');
        if (usesToConsume <= 0) throw new Error('Ingrese una cantidad válida de pases a usar.');

        await consumePasses(existingCard.id, usesToConsume);

        await onSuccess();
        handleClose();
        return;
      }

      if (mode === 'create_new') {
        if (usesTotal <= 0) throw new Error('Ingrese un número válido de usos.');
        if (price <= 0) throw new Error('Ingrese un precio válido.');

        const created = await createAccessCard({
          transactionId,
          uses: usesTotal,
          total: price,
        });

        if (usesToConsume > 0 && created?.id) {
          await consumePasses(created.id, usesToConsume);
        }

        await onSuccess();
        handleClose();
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar tarjeta de pases');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = mode === 'use_existing' ? 'Usar Tarjeta de Pases' : 'Agregar Tarjeta de Pases';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-3">
        <div className="text-sm text-gray-600">
          Cliente: <span className="font-medium text-gray-900">{clientKey.name || 'Sin nombre'}</span>
          {clientKey.doc ? <span className="text-gray-500"> · {clientKey.doc}</span> : null}
        </div>

        {isLoadingCard ? <div className="text-sm text-gray-500">Verificando tarjeta existente...</div> : null}

        {mode === 'use_existing' && existingCard ? (
          <div className="rounded-md border border-gray-200 p-3">
            <div className="text-sm">
              Tarjeta detectada:{' '}
              <span className="font-medium">{existingCard?.shortCode || existingCard?.code || existingCard?.id}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">(No se cobra. Solo se descuentan pases.)</div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create_new' ? (
            <>
              <Input
                label="Número de usos (tarjeta)"
                type="number"
                min={1}
                value={usesTotal}
                onChange={(e) => setUsesTotal(parseInt(e.target.value) || 0)}
              />

              <Input
                label="Precio ($)"
                type="number"
                min={0}
                step={0.01}
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              />

              <div className="text-xs text-gray-500">Regla POS: si no existe tarjeta previa, se crea y se cobra aquí.</div>
            </>
          ) : null}

          {mode === 'use_existing' || mode === 'create_new' ? (
            <Input
              label="Pases a usar ahora (Qty)"
              type="number"
              min={0}
              value={usesToConsume}
              onChange={(e) => setUsesToConsume(parseInt(e.target.value) || 0)}
            />
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>

            {mode === 'use_existing' ? (
              <button
                type="button"
                onClick={() => setMode('create_new')}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Crear nueva igual
              </button>
            ) : null}

            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Procesando...' : mode === 'use_existing' ? 'Usar pases' : 'Crear y cobrar'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
