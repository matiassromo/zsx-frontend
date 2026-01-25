'use client';

import { useState, useMemo } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { AccessCardsTable } from './components/AccessCardsTable';
import { AccessCardStats } from './components/AccessCardStats';
import { AccessCardFormModal } from './components/AccessCardFormModal';
import { DeleteAccessCardDialog } from './components/DeleteAccessCardDialog';
import { UsePassModal } from './components/UsePassModal';
import { SearchInput } from './components/SearchInput';
import { useAccessCards, type AccessCardWithUsage } from './hooks/useAccessCards';

export default function AccessCardsPage() {
  const { accessCards, isLoading, refetch, stats } = useAccessCards();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<AccessCardWithUsage | null>(null);
  const [deletingCard, setDeletingCard] = useState<AccessCardWithUsage | null>(null);
  const [usingPassCard, setUsingPassCard] = useState<AccessCardWithUsage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return accessCards;

    const query = searchQuery.toLowerCase().trim();
    return accessCards.filter((card) => {
      // Search by card ID or owner name
      const matchesId = card.id.toLowerCase().includes(query);
      const matchesOwner = card.owner?.name.toLowerCase().includes(query);
      return matchesId || matchesOwner;
    });
  }, [accessCards, searchQuery]);

  const handleCreateSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    refetch();
    setEditingCard(null);
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeletingCard(null);
  };

  const handleUsePassSuccess = () => {
    refetch();
    setUsingPassCard(null);
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Tarjetas 10 Pases" />

      <AccessCardStats
        total={stats.total}
        active={stats.active}
        finished={stats.finished}
        isLoading={isLoading}
      />

      <div className="max-w-md">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por dueno o ID... (ej: M, Ma, Matias)"
        />
      </div>

      <div className="flex justify-between items-center">
        <CreateButton label="Nueva Tarjeta" onClick={() => setIsCreateModalOpen(true)} />
      </div>

      <AccessCardsTable
        accessCards={filteredCards}
        isLoading={isLoading}
        onEdit={setEditingCard}
        onDelete={setDeletingCard}
        onUsePass={setUsingPassCard}
      />

      {/* Create Modal */}
      <AccessCardFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Edit Modal */}
      <AccessCardFormModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSuccess={handleEditSuccess}
        accessCard={editingCard || undefined}
      />

      {/* Delete Dialog */}
      <DeleteAccessCardDialog
        accessCard={deletingCard}
        isOpen={!!deletingCard}
        onClose={() => setDeletingCard(null)}
        onSuccess={handleDeleteSuccess}
      />

      {/* Use Pass Modal */}
      <UsePassModal
        isOpen={!!usingPassCard}
        onClose={() => setUsingPassCard(null)}
        onSuccess={handleUsePassSuccess}
        accessCard={usingPassCard}
      />
    </div>
  );
}
