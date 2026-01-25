'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { PaymentsTable } from './components/PaymentsTable';
import { PaymentFormModal } from './components/PaymentFormModal';
import { DeletePaymentDialog } from './components/DeletePaymentDialog';
import { usePayments } from './hooks/usePayments';
import type { PaymentWithTransaction } from './hooks/usePayments';

export default function PaymentsPage() {
  const { payments, isLoading, refetch } = usePayments();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentWithTransaction | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<PaymentWithTransaction | null>(null);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingPayment(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingPayment(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Pagos" />

      <div className="flex justify-between items-center">
        <CreateButton label="Agregar pago" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <PaymentsTable
        payments={payments}
        isLoading={isLoading}
        onEdit={setEditingPayment}
        onDelete={setDeletingPayment}
      />

      {/* Create Modal */}
      <PaymentFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <PaymentFormModal
        isOpen={!!editingPayment}
        onClose={() => setEditingPayment(null)}
        onSuccess={handleEditSuccess}
        payment={editingPayment || undefined}
      />

      {/* Delete Dialog */}
      <DeletePaymentDialog
        payment={deletingPayment}
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
