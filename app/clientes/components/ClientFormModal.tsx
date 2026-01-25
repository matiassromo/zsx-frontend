'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { Select } from '@/app/components/ui/Select';
import { createClient, updateClient } from '@/lib/api/clients';
import type { Client, ClientRequestDto, DocumentType } from '@/lib/api/types';
import toast from 'react-hot-toast';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client;
}

const documentTypeOptions = [
  { value: '', label: 'Sin documento' },
  { value: 'Cedula', label: 'Cedula' },
  { value: 'Ruc', label: 'RUC' },
];

const initialFormData: ClientRequestDto = {
  name: '',
  documentType: undefined,
  documentNumber: '',
  email: '',
  address: '',
  number: '',
};

export function ClientFormModal({ isOpen, onClose, onSuccess, client }: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientRequestDto>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!client;

  useEffect(() => {
    if (isOpen) {
      if (client) {
        setFormData({
          name: client.name,
          documentType: client.documentType,
          documentNumber: client.documentNumber || '',
          email: client.email || '',
          address: client.address || '',
          number: client.number || '',
        });
      } else {
        setFormData(initialFormData);
      }
      setErrors({});
    }
  }, [isOpen, client]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const data: ClientRequestDto = {
        name: formData.name.trim(),
        documentType: formData.documentType || undefined,
        documentNumber: formData.documentNumber?.trim() || null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        number: formData.number?.trim() || null,
      };

      if (isEditMode && client) {
        await updateClient(client.id, data);
        toast.success('Cliente actualizado correctamente');
      } else {
        await createClient(data);
        toast.success('Cliente creado correctamente');
      }

      onSuccess();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar cliente';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ClientRequestDto, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'documentType' ? (value as DocumentType) || undefined : value,
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
      title={isEditMode ? 'Editar Cliente' : 'Nuevo Cliente'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          error={errors.name}
          placeholder="Nombre del cliente"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Tipo de Documento"
            value={formData.documentType || ''}
            onChange={(e) => handleChange('documentType', e.target.value)}
            options={documentTypeOptions}
          />

          <Input
            label="Numero de Documento"
            value={formData.documentNumber || ''}
            onChange={(e) => handleChange('documentNumber', e.target.value)}
            placeholder="Ej: 1234567890"
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="correo@ejemplo.com"
        />

        <Input
          label="Direccion"
          value={formData.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Direccion del cliente"
        />

        <Input
          label="Telefono"
          type="tel"
          value={formData.number || ''}
          onChange={(e) => handleChange('number', e.target.value)}
          placeholder="Ej: 0999999999"
        />

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
