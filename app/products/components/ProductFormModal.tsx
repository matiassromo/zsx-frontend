'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { createBarProduct, updateBarProduct } from '@/lib/api/bar-products';
import type { BarProduct, BarProductRequestDto } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: BarProduct;
}

const initialFormData: BarProductRequestDto = {
  name: '',
  qty: 0,
  unitPrice: 0,
};

export function ProductFormModal({ isOpen, onClose, onSuccess, product }: ProductFormModalProps) {
  const [formData, setFormData] = useState<BarProductRequestDto>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!product;

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name,
          qty: product.qty,
          unitPrice: product.unitPrice,
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.qty < 0) {
      newErrors.qty = 'La cantidad no puede ser negativa';
    }

    if (formData.unitPrice < 0) {
      newErrors.unitPrice = 'El precio no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const data: BarProductRequestDto = {
        name: formData.name.trim(),
        qty: formData.qty,
        unitPrice: formData.unitPrice,
      };

      if (isEditMode && product) {
        await updateBarProduct(product.id, data);
        toast.success('Producto actualizado correctamente');
      } else {
        await createBarProduct(data);
        toast.success('Producto creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar producto';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof BarProductRequestDto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Nombre del producto"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Cantidad"
            type="number"
            min="0"
            step="1"
            value={formData.qty}
            onChange={(e) => handleChange('qty', parseInt(e.target.value) || 0)}
            error={errors.qty}
            placeholder="0"
          />

          <Input
            label="Precio Unitario"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => handleChange('unitPrice', parseFloat(e.target.value) || 0)}
            error={errors.unitPrice}
            placeholder="0.00"
          />
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
            ) : isEditMode ? (
              'Actualizar'
            ) : (
              'Crear'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
