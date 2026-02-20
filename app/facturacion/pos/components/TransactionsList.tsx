'use client';

import { useState, useMemo } from 'react';
import type { Transaction } from '@/lib/api/types';
import { TransactionCard } from './TransactionCard';

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  isCashBoxOpen: boolean;
}

type TabValue = 'open' | 'closed';

export function TransactionsList({
  transactions,
  isLoading,
  selectedId,
  onSelect,
  onCreateNew,
  isCashBoxOpen,
}: TransactionsListProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('open');
  const [searchQuery, setSearchQuery] = useState('');

  const { openTransactions, closedTransactions } = useMemo(() => {
    const open = transactions.filter((t) => t.status === 'Open');
    const closed = transactions.filter((t) => t.status === 'Closed');
    return { openTransactions: open, closedTransactions: closed };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const list = activeTab === 'open' ? openTransactions : closedTransactions;
    if (!searchQuery.trim()) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(
      (t) =>
        t.client?.name.toLowerCase().includes(query) ||
        t.client?.documentNumber?.toLowerCase().includes(query)
    );
  }, [activeTab, openTransactions, closedTransactions, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Tabs skeleton */}
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 rounded animate-pulse" />
        </div>
        {/* Cards skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'open'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Abiertas ({openTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'closed'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Cerradas ({closedTransactions.length})
          </button>
        </div>

        {/* New transaction button */}
        <button
          onClick={onCreateNew}
          disabled={!isCashBoxOpen}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Cuenta
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre o cédula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Transaction cards */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery
                ? 'No se encontraron resultados'
                : activeTab === 'open'
                ? 'No hay cuentas abiertas'
                : 'No hay cuentas cerradas'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              isSelected={selectedId === transaction.id}
              onClick={() => onSelect(transaction.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
