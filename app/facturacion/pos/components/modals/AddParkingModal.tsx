'use client';

import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/app/components/ui/Modal';
import { Input } from '@/app/components/ui/Input';
import { createParking, updateParking } from '@/lib/api/parkings';

type EditMode = 'create' | 'edit';

type ParkingInitialValues = {
  entryTime?: string;
  exitTime?: string | null;
};

interface AddParkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  onSuccess: () => Promise<void>;

  // NEW
  mode?: EditMode;
  parkingId?: string;
  initialValues?: ParkingInitialValues;
}

function toLocalDateTimeInput(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromLocalDateTimeInput(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function AddParkingModal({
  isOpen,
  onClose,
  transactionId,
  onSuccess,
  mode = 'create',
  parkingId,
  initialValues,
}: AddParkingModalProps) {
  const isEdit = mode === 'edit';

  const [entryLocal, setEntryLocal] = useState('');
  const [exitLocal, setExitLocal] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setError('');

    if (isEdit) {
      setEntryLocal(toLocalDateTimeInput(initialValues?.entryTime ?? null));
      setExitLocal(toLocalDateTimeInput(initialValues?.exitTime ?? null));
    } else {
      setEntryLocal('');
      setExitLocal('');
    }
  }, [isOpen, isEdit, initialValues?.entryTime, initialValues?.exitTime]);

  const canSubmit = useMemo(() => {
    if (isSubmitting) return false;
    if (!isEdit) return true; // create siempre permite
    if (!parkingId) return false;
    // en edit, al menos entryTime debe existir
    return !!entryLocal;
  }, [isSubmitting, isEdit, parkingId, entryLocal]);

  const handleClose = () => {
    setError('');
    setEntryLocal('');
    setExitLocal('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      if (!isEdit) {
        await createParking({
          transactionId,
          entryTime: new Date().toISOString(),
        });
        await onSuccess();
        handleClose();
        return;
      }

      if (!parkingId) throw new Error('Falta parkingId para editar.');

      const entryIso = fromLocalDateTimeInput(entryLocal);
      const exitIso = fromLocalDateTimeInput(exitLocal);

      if (!entryIso) throw new Error('Ingrese una fecha/hora de entrada válida.');

      await updateParking(parkingId, {
        transactionId,
        entryTime: entryIso,
        exitTime: exitIso, // puede ser null
      } as any);

      await onSuccess();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar parqueo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Editar Parqueo' : 'Registrar Parqueo'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isEdit ? (
          <p className="text-sm text-gray-600">
            Se registrará la entrada de parqueo con la hora actual.
          </p>
        ) : (
          <div className="space-y-3">
            <Input
              label="Entrada"
              type="datetime-local"
              value={entryLocal}
              onChange={(e) => setEntryLocal(e.target.value)}
            />
            <Input
              label="Salida (opcional)"
              type="datetime-local"
              value={exitLocal}
              onChange={(e) => setExitLocal(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Si dejas “Salida” vacío, el parqueo queda activo.
            </p>
          </div>
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
            {isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Registrar Parqueo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
