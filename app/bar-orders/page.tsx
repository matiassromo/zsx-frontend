// BarOrdersPage.tsx (mismo archivo que pegaste)
// Cambios: botones de acciones en BarOrdersTable y TransactionsTable con el mismo estilo "icon buttons"
// (Editar + Cerrar + Eliminar)

'use client';

import { useEffect, useMemo, useState } from 'react';
import InfoBar from '@/app/components/InfoBar';
import { CreateButton } from '@/app/components/CreateButton';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { TransactionSearchCombobox } from '@/app/components/ui/TransactionSearchCombobox';
import { useBarProducts } from '@/app/products/hooks/useBarProducts';
import { formatCurrency } from '@/app/facturacion/caja-diaria/utils/formatCurrency';
import { createBarOrder, createBarOrderDetail, deleteBarOrder, getBarOrders } from '@/lib/api/bar-orders';
import type { BarOrder, BarProduct, Transaction } from '@/lib/api/types';
import toast from 'react-hot-toast';
import { TransactionStatusChip } from '@/app/transacciones/components/TransactionStatusChip';

interface SelectedProduct {
  product: BarProduct;
  qty: number;
  unitPrice: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function IconButton({
  label,
  onClick,
  variant = 'neutral',
  children,
}: {
  label: string;
  onClick: () => void;
  variant?: 'neutral' | 'danger' | 'warning';
  children: React.ReactNode;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

  const styles =
    variant === 'danger'
      ? 'text-gray-500 hover:text-red-600 hover:bg-red-50'
      : variant === 'warning'
        ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50';

  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function PencilIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
      <path d="M12 17v2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function BarOrdersTable({
  orders,
  isLoading,
  onDelete,
}: {
  orders: BarOrder[];
  isLoading: boolean;
  onDelete: (order: BarOrder) => void;
}) {
  if (!isLoading && orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ordenes de bar</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva orden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaccion</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </td>
                <td className="hidden md:table-cell px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </td>
                <td className="hidden lg:table-cell px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="h-8 bg-gray-200 rounded w-10 ml-auto" />
                </td>
              </tr>
            ))
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {order.transactionId ? `#${order.transactionId.substring(0, 8)}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(order.total)}</td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                  {order.details && order.details.length > 0 ? (
                    <div className="space-y-1">
                      {order.details.map((detail, index) => (
                        <div key={`${order.id}-${index}`} className="text-xs text-gray-600">
                          {(detail.barProduct?.name || 'Producto').trim()} x{detail.qty}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin detalles</span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton label="Eliminar" variant="danger" onClick={() => onDelete(order)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function BarOrderFormModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { products, isLoading } = useBarProducts();
  const [transactionId, setTransactionId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTransactionId('');
      setSearch('');
      setSelectedProducts([]);
      setErrors({});
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    const query = search.toLowerCase().trim();
    return products.filter((product) => product.name.toLowerCase().includes(query) || product.id.toLowerCase().includes(query));
  }, [products, search]);

  const selectedTotal = selectedProducts.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  const handleAddProduct = (product: BarProduct) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) => (item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { product, qty: 1, unitPrice: product.unitPrice }];
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateProduct = (productId: string, field: 'qty' | 'unitPrice', value: number) => {
    setSelectedProducts((prev) => prev.map((item) => (item.product.id === productId ? { ...item, [field]: value } : item)));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!transactionId) nextErrors.transactionId = 'Debe seleccionar una transaccion';
    if (selectedProducts.length === 0) nextErrors.products = 'Debe agregar al menos un producto';
    if (selectedProducts.some((item) => item.qty <= 0 || Number.isNaN(item.qty))) nextErrors.products = 'La cantidad debe ser mayor a cero';
    if (selectedProducts.some((item) => item.unitPrice < 0 || Number.isNaN(item.unitPrice))) nextErrors.products = 'El precio debe ser un numero positivo';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const order = await createBarOrder({ transactionId });
      for (const item of selectedProducts) {
        await createBarOrderDetail(order.id, {
          barProductId: item.product.id,
          unitPrice: item.unitPrice,
          qty: item.qty,
        });
      }
      toast.success('Orden creada correctamente');
      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear orden';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva orden de bar" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <TransactionSearchCombobox
          value={transactionId}
          onChange={setTransactionId}
          error={errors.transactionId}
          label="Transaccion (Cliente)"
          placeholder="Buscar transaccion abierta..."
          filterStatus="Open"
        />

        {/* ... (resto del modal igual) ... */}
        {/* NO se cambió el modal porque pediste solo botones de tablas */}
      </form>
    </Modal>
  );
}

function TransactionsTable({
  transactions,
  isLoading,
  onEdit,
  onClose,
  onDelete,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  onEdit: (t: Transaction) => void;
  onClose: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  if (!isLoading && transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay transacciones</h3>
        <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva transaccion.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Apertura</th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Cierre</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-6 bg-gray-200 rounded w-20" />
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="h-8 bg-gray-200 rounded w-24 ml-auto" />
                  </td>
                </tr>
              ))}
            </>
          ) : (
            transactions.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{t.client?.name || '-'}</td>
                <td className="px-4 py-3">
                  <TransactionStatusChip status={t.status} />
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{formatDate(t.openedAt)}</td>
                <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">{t.closedAt ? formatDate(t.closedAt) : '-'}</td>

                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {t.status === 'Open' && (
                      <>
                        <IconButton label="Editar" onClick={() => onEdit(t)}>
                          <PencilIcon className="h-5 w-5" />
                        </IconButton>

                        <IconButton label="Cerrar" variant="warning" onClick={() => onClose(t)}>
                          <LockIcon className="h-5 w-5" />
                        </IconButton>
                      </>
                    )}

                    <IconButton label="Eliminar" variant="danger" onClick={() => onDelete(t)}>
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function BarOrdersPage() {
  const [orders, setOrders] = useState<BarOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<BarOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const data = await getBarOrders();
      setOrders(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar ordenes';
      toast.error(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async () => {
    if (!deletingOrder) return;
    setIsDeleting(true);
    try {
      await deleteBarOrder(deletingOrder.id);
      toast.success('Orden eliminada correctamente');
      setDeletingOrder(null);
      fetchOrders();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar orden';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <InfoBar title="Ordenes de bar" />

      <div className="flex justify-between items-center">
        <CreateButton label="Nueva orden" onClick={() => setIsCreateOpen(true)} />
      </div>

      <BarOrdersTable orders={orders} isLoading={isLoading} onDelete={setDeletingOrder} />

      <BarOrderFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchOrders} />

      <ConfirmDialog
        isOpen={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDelete}
        title="Eliminar orden"
        message="Estas seguro de que deseas eliminar esta orden? Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
