'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { getBarProducts } from '@/lib/api/bar-products';
import { createBarOrder, createBarOrderDetail } from '@/lib/api/bar-orders';
import type { BarProduct } from '@/lib/api/types';

interface AddBarOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;
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

export function AddBarOrderModal({ isOpen, onClose, transactionId, onSuccess }: AddBarOrderModalProps) {
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await getBarProducts();
      setProducts(data.filter((p) => p.qty > 0)); // Only show products with stock
    } catch (err) {
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
          item.productId === product.id
            ? { ...item, qty: item.qty + 1 }
            : item
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
        prev.map((item) =>
          item.productId === productId ? { ...item, qty } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.unitPrice * item.qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      setError('Agregue al menos un producto');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      // Create the bar order
      const order = await createBarOrder({ transactionId });

      // Add details
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
      setError(err instanceof Error ? err.message : 'Error al crear pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCart([]);
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Pedido de Bar" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500">Cargando productos...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No hay productos disponibles</div>
        ) : (
          <>
            {/* Product grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Productos
              </label>
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

            {/* Cart */}
            {cart.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido
                </label>
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

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

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
            disabled={isSubmitting || cart.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isSubmitting ? 'Agregando...' : `Agregar Pedido (${formatCurrency(cartTotal)})`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
