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
import {
  createBarOrder,
  createBarOrderDetail,
  deleteBarOrder,
  getBarOrders,
} from '@/lib/api/bar-orders';
import type { BarOrder, BarProduct } from '@/lib/api/types';
import toast from 'react-hot-toast';

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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaccion
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Detalles
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
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
                <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-sm text-gray-500">
                  {order.details && order.details.length > 0 ? (
                    <div className="space-y-1">
                  {order.details.map((detail, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="text-xs text-gray-600"
                    >
                          {(detail.barProduct?.name || 'Producto').trim()} x{detail.qty}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">Sin detalles</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(order)}
                    className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    aria-label="Eliminar orden"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
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
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.id.toLowerCase().includes(query)
      );
    });
  }, [products, search]);

  const selectedTotal = selectedProducts.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  const handleAddProduct = (product: BarProduct) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, unitPrice: product.unitPrice }];
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateProduct = (
    productId: string,
    field: 'qty' | 'unitPrice',
    value: number
  ) => {
    setSelectedProducts((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, [field]: value } : item
      )
    );
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!transactionId) {
      nextErrors.transactionId = 'Debe seleccionar una transaccion';
    }
    if (selectedProducts.length === 0) {
      nextErrors.products = 'Debe agregar al menos un producto';
    }
    if (
      selectedProducts.some((item) => item.qty <= 0 || Number.isNaN(item.qty))
    ) {
      nextErrors.products = 'La cantidad debe ser mayor a cero';
    }
    if (
      selectedProducts.some((item) => item.unitPrice < 0 || Number.isNaN(item.unitPrice))
    ) {
      nextErrors.products = 'El precio debe ser un numero positivo';
    }

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

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Input
              label="Buscar producto"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Escriba para filtrar..."
            />

            <div className="border border-gray-200 rounded-md max-h-64 overflow-auto">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Cargando productos...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">No hay productos</div>
              ) : (
                filteredProducts.map((product) => {
                  const isAdded = selectedProducts.some(
                    (item) => item.product.id === product.id
                  );
                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(product.unitPrice)} - Stock: {product.qty}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddProduct(product)}
                        className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
                          isAdded
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'text-blue-600 border-blue-200 hover:bg-blue-50'
                        }`}
                        disabled={isAdded}
                      >
                        {isAdded ? 'Agregado' : 'Agregar'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Detalle de orden</h3>
              <span className="text-sm text-gray-600">{formatCurrency(selectedTotal)}</span>
            </div>

            <div className="border border-gray-200 rounded-md max-h-64 overflow-auto">
              {selectedProducts.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  Agregue productos desde la lista.
                </div>
              ) : (
                selectedProducts.map((item) => (
                  <div
                    key={item.product.id}
                    className="px-4 py-3 border-b border-gray-100 last:border-b-0 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-xs text-gray-500">
                          Disponible: {item.product.qty}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(item.product.id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateProduct(item.product.id, 'qty', Number(e.target.value))
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Precio unitario
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateProduct(
                              item.product.id,
                              'unitPrice',
                              Number(e.target.value)
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {errors.products && <p className="text-sm text-red-500">{errors.products}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Guardando...
              </span>
            ) : (
              'Crear orden'
            )}
          </button>
        </div>
      </form>
    </Modal>
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

      <BarOrderFormModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchOrders}
      />

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


