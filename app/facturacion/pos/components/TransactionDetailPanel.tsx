'use client';

import { useState } from 'react';
import type { TransactionDetail, EntranceTransaction, Parking, AccessCard } from '@/lib/api/types';

import { ClientSection } from './sections/ClientSection';
import { EntranceSection } from './sections/EntranceSection';
import { KeysSection } from './sections/KeysSection';
import { ParkingSection } from './sections/ParkingSection';
import { BarSection } from './sections/BarSection';
import { AccessCardsSection } from './sections/AccessCardsSection';
import { PaymentsSection } from './sections/PaymentsSection';
import { TotalsSection } from './sections/TotalsSection';

import { AddEntranceModal } from './modals/AddEntranceModal';
import { AssignKeyModal } from './modals/AssignKeyModal';
import { AddParkingModal } from './modals/AddParkingModal';
import { AddBarOrderModal } from './modals/AddBarOrderModal';
import { AddAccessCardModal } from './modals/AddAccessCardModal';
import { AddPaymentModal } from './modals/AddPaymentModal';
import { CloseTransactionDialog } from './modals/CloseTransactionDialog';

import { ExportReceiptButton } from '../components/ExportReceiptButton';
import { ReceiptPrintView } from '../components/ReceiptPrintView';

import { deleteEntranceTransaction } from '@/lib/api/entrance-transactions';
import { deleteParking } from '@/lib/api/parkings';
import { deleteBarOrderDetail } from '@/lib/api/bar-orders';
import { deleteAccessCard } from '@/lib/api/access-cards';

type EntranceEditState = null | {
  id: string;
  initial: {
    numberAdults: number;
    numberChildren: number;
    numberSeniors: number;
    numberDisabled: number;
  };
};

type ParkingEditState = null | {
  id: string;
  initial: {
    entryTime?: string;
    exitTime?: string | null;
  };
};

type AccessCardEditState = null | {
  id: string;
  initial: {
    uses?: number;
    total?: number;
  };
};

type BarDetailEditState = null | {
  orderId: string;
  barProductId: string;
  initial: {
    qty: number;
    unitPrice: number;
    name: string;
  };
};

interface TransactionDetailPanelProps {
  detail: TransactionDetail | null;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
}

export function TransactionDetailPanel({ detail, isLoading, onRefresh }: TransactionDetailPanelProps) {
  const [isEntranceModalOpen, setIsEntranceModalOpen] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);
  const [isBarOrderModalOpen, setIsBarOrderModalOpen] = useState(false);
  const [isAccessCardModalOpen, setIsAccessCardModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  // NEW edit states
  const [entranceEdit, setEntranceEdit] = useState<EntranceEditState>(null);
  const [parkingEdit, setParkingEdit] = useState<ParkingEditState>(null);
  const [accessCardEdit, setAccessCardEdit] = useState<AccessCardEditState>(null);
  const [barDetailEdit, setBarDetailEdit] = useState<BarDetailEditState>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">Selecciona una cuenta para ver los detalles</p>
      </div>
    );
  }

  const {
    transaction,
    entrances,
    parkings,
    barOrders,
    accessCards,
    keys,
    totalCharges,
    totalPayments,
    pendingBalance,
  } = detail;

  const isOpen = transaction.status === 'Open';

  async function handleDeleteEntrance(e: EntranceTransaction) {
    await deleteEntranceTransaction(e.id);
    await onRefresh();
  }

  async function handleDeleteParking(p: Parking) {
    await deleteParking(p.id);
    await onRefresh();
  }

  async function handleDeleteAccessCard(c: AccessCard) {
    await deleteAccessCard(c.id);
    await onRefresh();
  }

  async function handleDeleteBarDetail(ref: { orderId: string; barProductId: string }) {
    await deleteBarOrderDetail(ref.orderId, ref.barProductId);
    await onRefresh();
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      <ClientSection client={transaction.client} />

      <EntranceSection
        entrances={entrances}
        isOpen={isOpen}
        onAdd={() => {
          setEntranceEdit(null);
          setIsEntranceModalOpen(true);
        }}
        onEdit={(e) => {
          setEntranceEdit({
            id: e.id,
            initial: {
              numberAdults: e.numberAdults ?? 0,
              numberChildren: e.numberChildren ?? 0,
              numberSeniors: e.numberSeniors ?? 0,
              numberDisabled: e.numberDisabled ?? 0,
            },
          });
          setIsEntranceModalOpen(true);
        }}
        onDelete={handleDeleteEntrance}
      />

      <KeysSection
        keys={keys}
        isOpen={isOpen}
        onAdd={() => setIsKeyModalOpen(true)}
        onRefresh={onRefresh}
      />

      <ParkingSection
        parkings={parkings}
        isOpen={isOpen}
        onAdd={() => {
          setParkingEdit(null);
          setIsParkingModalOpen(true);
        }}
        onEdit={(p) => {
          setParkingEdit({
            id: p.id,
            initial: {
              entryTime: p.entryTime,
              exitTime: p.exitTime ?? null,
            },
          });
          setIsParkingModalOpen(true);
        }}
        onDelete={handleDeleteParking}
      />

      <BarSection
        barOrders={barOrders}
        isOpen={isOpen}
        onAdd={() => {
          setBarDetailEdit(null);
          setIsBarOrderModalOpen(true);
        }}
        onEditDetail={(ref) => {
          setBarDetailEdit({
            orderId: ref.orderId,
            barProductId: ref.barProductId,
            initial: {
              qty: ref.qty,
              unitPrice: ref.unitPrice,
              name: ref.name,
            },
          });
          setIsBarOrderModalOpen(true);
        }}
        onDeleteDetail={handleDeleteBarDetail}
      />

      <AccessCardsSection
        accessCards={accessCards}
        isOpen={isOpen}
        onAdd={() => {
          setAccessCardEdit(null);
          setIsAccessCardModalOpen(true);
        }}
        onEdit={(c) => {
          setAccessCardEdit({
            id: c.id,
            initial: {
              uses: c.uses,
              total: c.total,
            },
          });
          setIsAccessCardModalOpen(true);
        }}
        onDelete={handleDeleteAccessCard}
      />

      <PaymentsSection
        payments={transaction.payments || []}
        isOpen={isOpen}
        onAdd={() => setIsPaymentModalOpen(true)}
        onRefresh={onRefresh}
      />

      <div className="p-4">
        <ExportReceiptButton
          targetId={`receipt-${transaction.id}`}
          disabled={!detail}
          label="Imprimir comprobante"
        />
      </div>

      <div className="absolute -left-[9999px] -top-[9999px]">
        <div id={`receipt-${transaction.id}`}>
          <ReceiptPrintView detail={detail} logoSrc="/brand/logo.png" />
        </div>
      </div>

      <TotalsSection
        totalCharges={totalCharges}
        totalPayments={totalPayments}
        pendingBalance={pendingBalance}
        isOpen={isOpen}
        onClose={() => setIsCloseDialogOpen(true)}
      />

      <AddEntranceModal
        isOpen={isEntranceModalOpen}
        onClose={() => setIsEntranceModalOpen(false)}
        transactionId={transaction.id}
        onSuccess={onRefresh}
        mode={entranceEdit ? 'edit' : 'create'}
        entranceId={entranceEdit?.id}
        initialValues={entranceEdit?.initial}
      />

      <AssignKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        transactionId={transaction.id}
        onSuccess={onRefresh}
      />

      <AddParkingModal
        isOpen={isParkingModalOpen}
        onClose={() => setIsParkingModalOpen(false)}
        transactionId={transaction.id}
        onSuccess={onRefresh}
        mode={parkingEdit ? 'edit' : 'create'}
        parkingId={parkingEdit?.id}
        initialValues={parkingEdit?.initial}
      />

      <AddBarOrderModal
        isOpen={isBarOrderModalOpen}
        onClose={() => setIsBarOrderModalOpen(false)}
        transactionId={transaction.id}
        onSuccess={onRefresh}
        mode={barDetailEdit ? 'edit' : 'create'}
        orderId={barDetailEdit?.orderId}
        barProductId={barDetailEdit?.barProductId}
        initialValues={barDetailEdit?.initial}
      />

      <AddAccessCardModal
        isOpen={isAccessCardModalOpen}
        onClose={() => setIsAccessCardModalOpen(false)}
        transactionId={transaction.id}
        client={transaction.client ?? null}
        onSuccess={onRefresh}
        mode={accessCardEdit ? 'edit' : 'create'}
        accessCardId={accessCardEdit?.id}
        initialValues={accessCardEdit?.initial}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        transactionId={transaction.id}
        pendingBalance={pendingBalance}
        onSuccess={onRefresh}
      />

      <CloseTransactionDialog
        isOpen={isCloseDialogOpen}
        onClose={() => setIsCloseDialogOpen(false)}
        transactionId={transaction.id}
        pendingBalance={pendingBalance}
        onSuccess={onRefresh}
      />
    </div>
  );
}
