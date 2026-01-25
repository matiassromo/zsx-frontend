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

function onlyDigits(s: string) {
  return (s ?? '').replace(/\D+/g, '');
}

// --- Teléfono Ecuador (opcional) ---
function isValidEcuadorPhone(phone: string) {
  const p = onlyDigits(phone);

  // opcional
  if (!p) return true;

  // móvil: 10 dígitos, empieza 09
  if (/^09\d{8}$/.test(p)) return true;

  // fijo: 9 dígitos, empieza 02..07
  if (/^0[2-7]\d{7}$/.test(p)) return true;

  return false;
}

function normalizePhoneForSend(phone: string) {
  const p = onlyDigits(phone);
  return p ? p : null;
}

// --- Cédula Ecuador ---
function isValidEcuadorCedula(cedula: string) {
  if (!/^\d{10}$/.test(cedula)) return false;

  const prov = Number(cedula.slice(0, 2));
  if (prov < 1 || prov > 24) return false;

  const third = Number(cedula[2]);
  if (third < 0 || third > 5) return false;

  const digits = cedula.split('').map(Number);
  const check = digits[9];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let v = digits[i];
    if (i % 2 === 0) {
      v *= 2;
      if (v > 9) v -= 9;
    }
    sum += v;
  }
  const nextTen = Math.ceil(sum / 10) * 10;
  const verifier = (nextTen - sum) % 10;

  return verifier === check;
}

// --- RUC Ecuador (natural / público / privado) ---
function mod11Check(digits: number[], coefs: number[], checkDigit: number) {
  let sum = 0;
  for (let i = 0; i < coefs.length; i++) sum += digits[i] * coefs[i];
  const mod = sum % 11;
  const verifier = mod === 0 ? 0 : 11 - mod;
  return verifier === checkDigit;
}

function isValidEcuadorRuc(ruc: string) {
  if (!/^\d{13}$/.test(ruc)) return false;

  const prov = Number(ruc.slice(0, 2));
  if (prov < 1 || prov > 24) return false;

  const third = Number(ruc[2]);
  const estab = ruc.slice(10, 13);

  // establecimiento no puede ser 000
  if (estab === '000') return false;

  const digits = ruc.split('').map(Number);

  // Natural (0-5): primeros 10 como cédula (estab puede ser distinto, no obligo 001)
  if (third >= 0 && third <= 5) {
    return isValidEcuadorCedula(ruc.slice(0, 10));
  }

  // Pública (6): verificador en pos 9 (index 8) y estab debe ser 001
  if (third === 6) {
    if (estab !== '001') return false;
    const checkDigit = digits[8];
    const coefs = [3, 2, 7, 6, 5, 4, 3, 2];
    return mod11Check(digits, coefs, checkDigit);
  }

  // Privada (9): verificador en pos 10 (index 9) y estab debe ser 001
  if (third === 9) {
    if (estab !== '001') return false;
    const checkDigit = digits[9];
    const coefs = [4, 3, 2, 7, 6, 5, 4, 3, 2];
    return mod11Check(digits, coefs, checkDigit);
  }

  return false;
}

export function ClientFormModal({ isOpen, onClose, onSuccess, client }: ClientFormModalProps) {
  const [formData, setFormData] = useState<ClientRequestDto>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!client;

  useEffect(() => {
    if (!isOpen) return;

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
  }, [isOpen, client]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const dt = formData.documentType || '';
    const dn = onlyDigits(formData.documentNumber || '');

    // Documento
    if (!dt) {
      if (dn.length > 0) newErrors.documentNumber = 'Si seleccionas "Sin documento", deja el número vacío';
    } else if (dt === 'Cedula') {
      if (!isValidEcuadorCedula(dn)) newErrors.documentNumber = 'Cédula inválida';
    } else if (dt === 'Ruc') {
      if (!isValidEcuadorRuc(dn)) newErrors.documentNumber = 'RUC inválido';
    }

    // Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido';
    }

    // Teléfono (opcional)
    if (formData.number && !isValidEcuadorPhone(formData.number)) {
      newErrors.number = 'Teléfono inválido (EC). Ej: 0999999999 o 022345678';
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
        documentNumber: formData.documentNumber ? onlyDigits(formData.documentNumber) : null,
        email: formData.email?.trim() || null,
        address: formData.address?.trim() || null,
        number: normalizePhoneForSend(formData.number || ''),
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
    setFormData((prev) => {
      // documentType
      if (field === 'documentType') {
        const nextType = (value as DocumentType) || undefined;

        // si cambias a "Sin documento", limpia el número
        return {
          ...prev,
          documentType: nextType,
          documentNumber: nextType ? prev.documentNumber : '',
        };
      }

      // documentNumber: solo dígitos + max len según tipo
      if (field === 'documentNumber') {
        const digits = onlyDigits(value);
        const dt = prev.documentType || '';
        const max = dt === 'Ruc' ? 13 : dt === 'Cedula' ? 10 : 0;
        return {
          ...prev,
          documentNumber: max ? digits.slice(0, max) : '',
        };
      }

      // number (teléfono): solo dígitos, max 10
      if (field === 'number') {
        const digits = onlyDigits(value).slice(0, 10);
        return { ...prev, number: digits };
      }

      return { ...prev, [field]: value };
    });

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
            placeholder={formData.documentType === 'Ruc' ? 'Ej: 1790012345001' : 'Ej: 1234567890'}
            error={errors.documentNumber}
            disabled={!formData.documentType}
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
          error={errors.number}
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
