'use client';

import { useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { ClientsTable } from './components/ClientsTable';
import { ClientFormModal } from './components/ClientFormModal';
import { DeleteClientDialog } from './components/DeleteClientDialog';
import { useClients } from './hooks/useClients';
import type { Client } from '@/lib/api/types';

export default function ClientesPage() {
  const { clients, isLoading, refetch } = useClients();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingClient(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingClient(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Clientes" />

      <div className="flex justify-between items-center">
        <CreateButton label="Agregar cliente" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <ClientsTable
        clients={clients}
        isLoading={isLoading}
        onEdit={setEditingClient}
        onDelete={setDeletingClient}
      />

      {/* Create Modal */}
      <ClientFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <ClientFormModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={handleEditSuccess}
        client={editingClient || undefined}
      />

      {/* Delete Dialog */}
      <DeleteClientDialog
        client={deletingClient}
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
