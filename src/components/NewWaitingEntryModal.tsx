import React, { useState, useEffect } from 'react';

export interface WaitingListData {
  fecha_reserva: string;
  invitados: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  membership_id?: string;
  client_tags?: string[];
  reservation_tags?: string[];
  notas?: string;
}

interface NewWaitingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WaitingListData) => Promise<void>;
  initialData?: WaitingListData;
}

const NewWaitingEntryModal: React.FC<NewWaitingEntryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [fechaReservaDate, setFechaReservaDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState<Omit<WaitingListData, 'fecha_reserva'>>({
    invitados: 2,
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    membership_id: '',
    client_tags: [],
    reservation_tags: [],
    notas: '',
  });

  // Cargar datos iniciales cuando el modal se abre o cambia initialData
  useEffect(() => {
    if (initialData) {
      setFechaReservaDate(new Date(initialData.fecha_reserva));
      setFormData({
        invitados: initialData.invitados,
        nombre: initialData.nombre,
        apellido: initialData.apellido,
        telefono: initialData.telefono || '',
        email: initialData.email || '',
        membership_id: initialData.membership_id || '',
        client_tags: initialData.client_tags || [],
        reservation_tags: initialData.reservation_tags || [],
        notas: initialData.notas || '',
      });
    } else {
      setFechaReservaDate(new Date());
      setFormData({
        invitados: 2,
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        membership_id: '',
        client_tags: [],
        reservation_tags: [],
        notas: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'invitados' ? Number(value) : value,
    }));
  };

  // Para simplificar, asumiremos que tags se ingresan como string separados por comas
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'client_tags' | 'reservation_tags') => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({
      ...prev,
      [field]: tags,
    }));
  };

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFechaReservaDate(new Date(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.apellido || !formData.invitados || !fechaReservaDate) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const dataToSubmit: WaitingListData = {
      ...formData,
      fecha_reserva: fechaReservaDate.toISOString(),
    };

    await onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-4">
          {initialData ? 'Editar Entrada' : 'Nueva Entrada'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium">Fecha Reserva *</label>
            <input
              type="datetime-local"
              value={fechaReservaDate.toISOString().slice(0, 16)}
              onChange={handleFechaChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Invitados *</label>
            <input
              type="number"
              name="invitados"
              min={1}
              value={formData.invitados}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block font-medium">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Membership ID</label>
            <input
              type="text"
              name="membership_id"
              value={formData.membership_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Client Tags (separados por coma)</label>
            <input
              type="text"
              value={formData.client_tags?.join(', ') || ''}
              onChange={e => handleTagsChange(e, 'client_tags')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Reservation Tags (separados por coma)</label>
            <input
              type="text"
              value={formData.reservation_tags?.join(', ') || ''}
              onChange={e => handleTagsChange(e, 'reservation_tags')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-medium">Notas</label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#CC5500] text-white hover:bg-[#FF6B00]"
            >
              {initialData ? 'Guardar cambios' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewWaitingEntryModal;
