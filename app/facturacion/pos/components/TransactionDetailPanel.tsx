'use client';

import { useState } from 'react';
import type { TransactionDetail } from '@/lib/api/types';
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
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="mt-2 text-sm text-gray-500">
          Selecciona una cuenta para ver los detalles
        </p>
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

  return (
    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
      <ClientSection client={transaction.client} />

      <EntranceSection
        entrances={entrances}
        isOpen={isOpen}
        onAdd={() => setIsEntranceModalOpen(true)}
        onRefresh={onRefresh}
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
        onAdd={() => setIsParkingModalOpen(true)}
        onRefresh={onRefresh}
      />

      <BarSection
        barOrders={barOrders}
        isOpen={isOpen}
        onAdd={() => setIsBarOrderModalOpen(true)}
        onRefresh={onRefresh}
      />

      <AccessCardsSection
        accessCards={accessCards}
        isOpen={isOpen}
        onAdd={() => setIsAccessCardModalOpen(true)}
        onRefresh={onRefresh}
      />

      <PaymentsSection
        payments={transaction.payments || []}
        isOpen={isOpen}
        onAdd={() => setIsPaymentModalOpen(true)}
        onRefresh={onRefresh}
      />

        {/* Acciones */}
        <div className="p-4">
          <ExportReceiptButton
            targetId={`receipt-${transaction.id}`}
            disabled={!detail}
            label="Imprimir comprobante"
          />
        </div>

        {/* Vista oculta para generar el PDF */}
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
      />

      <AddBarOrderModal
        isOpen={isBarOrderModalOpen}
        onClose={() => setIsBarOrderModalOpen(false)}
        transactionId={transaction.id}
        onSuccess={onRefresh}
      />

      <AddAccessCardModal
        isOpen={isAccessCardModalOpen}
        onClose={() => setIsAccessCardModalOpen(false)}
        transactionId={transaction.id}
        client={transaction.client ?? null}
        onSuccess={onRefresh}
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
