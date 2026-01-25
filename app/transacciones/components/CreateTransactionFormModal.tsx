'use client';

import { TransactionFormModal } from './TransactionFormModal';

interface CreateTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTransactionFormModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTransactionFormModalProps) {
  return (
    <TransactionFormModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
