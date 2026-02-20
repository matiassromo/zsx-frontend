'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getTransactions } from '@/lib/api/transactions';
import type { Transaction } from '@/lib/api/types';

interface TransactionSearchComboboxProps {
  value: string;
  onChange: (transactionId: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  filterStatus?: 'Open' | 'Closed';
}

export function TransactionSearchCombobox({
  value,
  onChange,
  error,
  label = 'Transacción',
  placeholder = 'Buscar transacción...',
  filterStatus = 'Open',
}: TransactionSearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch transactions on mount
  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const data = await getTransactions();
        // Filter by status
        const filtered = data.filter((t) => t.status === filterStatus);
        setTransactions(filtered);
      } catch {
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTransactions();
  }, [filterStatus]);

  // Filter transactions based on search (by client name)
  const filteredTransactions = transactions.filter((transaction) => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      transaction.client?.name.toLowerCase().includes(searchLower) ||
      transaction.id.toLowerCase().includes(searchLower)
    );
  });

  // Get selected transaction display name
  const selectedTransaction = transactions.find((t) => t.id === value);
  const displayValue = selectedTransaction
    ? `${selectedTransaction.client?.name || 'Sin cliente'} - #${selectedTransaction.id.substring(0, 8)}`
    : '';

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered results change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [debouncedSearch]);

  const handleSelect = useCallback(
    (transaction: Transaction) => {
      onChange(transaction.id);
      setSearch('');
      setIsOpen(false);
    },
    [onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredTransactions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTransactions[highlightedIndex]) {
          handleSelect(filteredTransactions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          <span className="text-red-500 ml-1">*</span>
        </label>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={value ? '' : placeholder}
          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {value && !isOpen && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!value && !isOpen && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-gray-500">Cargando...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No hay transacciones abiertas
            </div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <button
                key={transaction.id}
                type="button"
                onClick={() => handleSelect(transaction)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full px-3 py-2 text-left text-sm flex flex-col ${
                  index === highlightedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                } ${transaction.id === value ? 'bg-blue-100' : ''}`}
              >
                <span className="font-medium text-gray-900">
                  {transaction.client?.name || 'Sin cliente'}
                </span>
                <span className="text-gray-500 text-xs font-mono">
                  #{transaction.id.substring(0, 8)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
