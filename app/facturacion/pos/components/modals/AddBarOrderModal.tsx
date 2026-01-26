'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';

import { getBarProducts } from '@/lib/api/bar-products';
import {
  createBarOrder,
  createBarOrderDetail,
  updateBarOrderDetail,
} from '@/lib/api/bar-orders';

import type { BarProduct } from '@/lib/api/types';

type EditMode = 'create' | 'edit';

type BarDetailInitialValues = {
  qty: number;
  unitPrice: number;
  name: string;
};

interface AddBarOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;

  // NEW (para editar una línea)
  mode?: EditMode;
  orderId?: string;
  barProductId?: string;
  initialValues?: BarDetailInitialValues;
}

interface CartItem {
  productId: string;
  product: BarProduct;
  qty: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function AddBarOrderModal({
  isOpen,
  onClose,
  transactionId,
  onSuccess,
  mode = 'create',
  orderId,
  barProductId,
  initialValues,
}: AddBarOrderModalProps) {
  const isEdit = mode === 'edit';

  // CREATE STATE
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // EDIT STATE (una sola línea)
  const [editQty, setEditQty] = useState(1);
  const [editUnitPrice, setEditUnitPrice] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // precarga cuando es EDIT
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    if (isEdit) {
      setEditQty(initialValues?.qty ?? 1);
      setEditUnitPrice(initialValues?.unitPrice ?? 0);
      return;
    }

    // CREATE: carga productos
    loadProducts();
  }, [isOpen, isEdit, initialValues?.qty, initialValues?.unitPrice]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getBarProducts();
      setProducts(data.filter((p) => p.qty > 0));
    } catch {
      setError('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: BarProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { productId: product.id, product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } else {
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, qty } : item))
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;

    if (isEdit) {
      if (!orderId || !barProductId) return false;
      if (editQty <= 0) return false;
      if (editUnitPrice < 0) return false;
      return true;
    }

    return cart.length > 0;
  }, [isSubmitting, isEdit, orderId, barProductId, editQty, editUnitPrice, cart.length]);

  const handleClose = () => {
    setCart([]);
    setProducts([]);
    setError('');
    setEditQty(1);
    setEditUnitPrice(0);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      setIsSubmitting(true);

      // EDIT (una línea)
      if (isEdit) {
        if (!orderId) throw new Error('Falta orderId para editar.');
        if (!barProductId) throw new Error('Falta barProductId para editar.');
        if (editQty <= 0) throw new Error('Ingrese una cantidad válida.');
        if (editUnitPrice < 0) throw new Error('Ingrese un precio válido.');

        await updateBarOrderDetail(orderId, barProductId, {
          qty: editQty,
          unitPrice: editUnitPrice,
        });

        await onSuccess();
        handleClose();
        return;
      }

      // CREATE (tu flujo actual)
      if (cart.length === 0) {
        setError('Agregue al menos un producto');
        return;
      }

      const order = await createBarOrder({ transactionId });

      for (const item of cart) {
        await createBarOrderDetail(order.id, {
          barProductId: item.productId,
          unitPrice: item.product.unitPrice,
          qty: item.qty,
        });
      }

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = isEdit
    ? `Editar ítem (${initialValues?.name ?? 'Producto'})`
    : 'Pedido de Bar';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size={isEdit ? 'md' : 'lg'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isEdit ? (
          <>
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-sm text-gray-700">
                Producto: <span className="font-medium">{initialValues?.name ?? 'Producto'}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Ajusta cantidad y/o precio unitario de esta línea.
              </div>
            </div>

            <Input
              label="Cantidad (Qty)"
              type="number"
              min={1}
              value={editQty}
              onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
            />

            <Input
              label="Precio unitario ($)"
              type="number"
              min={0}
              step={0.01}
              value={editUnitPrice}
              onChange={(e) => setEditUnitPrice(parseFloat(e.target.value) || 0)}
            />

            <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Total línea</span>
              <span className="font-medium text-gray-900">
                {formatCurrency((editQty || 0) * (editUnitPrice || 0))}
              </span>
            </div>
          </>
        ) : (
          <>
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">Cargando productos...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No hay productos disponibles</div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Productos</label>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {products.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addToCart(product)}
                        className="flex items-center justify-between p-2 text-left text-sm bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                      >
                        <span className="truncate">{product.name}</span>
                        <span className="ml-2 text-gray-600 shrink-0">
                          {formatCurrency(product.unitPrice)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {cart.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pedido</label>
                    <div className="space-y-2 border border-gray-200 rounded-md p-2">
                      {cart.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between text-sm">
                          <span className="truncate">{item.product.name}</span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300"
                            >
                              -
                            </button>
                            <span className="w-6 text-center">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.productId, item.qty + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300"
                            >
                              +
                            </button>
                            <span className="ml-2 w-16 text-right text-gray-600">
                              {formatCurrency(item.product.unitPrice * item.qty)}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 font-medium">
                        <span>Total</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!canSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Procesando...'
              : isEdit
              ? 'Guardar cambios'
              : `Agregar Pedido (${formatCurrency(cartTotal)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
