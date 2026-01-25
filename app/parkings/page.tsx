'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { ParkingsTable } from './components/ParkingsTable';
import { ParkingFormModal } from './components/ParkingFormModal';
import { DeleteParkingDialog } from './components/DeleteParkingDialog';
import { useParkings } from './hooks/useParkings';
import type { ParkingWithTransaction } from './hooks/useParkings';

export default function ParkingsPage() {
  const { parkings, isLoading, refetch } = useParkings();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingParking, setEditingParking] = useState<ParkingWithTransaction | null>(null);
  const [deletingParking, setDeletingParking] = useState<ParkingWithTransaction | null>(null);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingParking(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingParking(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Parqueos" />

      <div className="flex justify-between items-center">
        <CreateButton label="Agregar parqueo" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <ParkingsTable
        parkings={parkings}
        isLoading={isLoading}
        onEdit={setEditingParking}
        onDelete={setDeletingParking}
      />

      {/* Create Modal */}
      <ParkingFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <ParkingFormModal
        isOpen={!!editingParking}
        onClose={() => setEditingParking(null)}
        onSuccess={handleEditSuccess}
        parking={editingParking || undefined}
      />

      {/* Delete Dialog */}
      <DeleteParkingDialog
        parking={deletingParking}
        isOpen={!!deletingParking}
        onClose={() => setDeletingParking(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
