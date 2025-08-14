import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewWaitingEntryModal from '../components/NewWaitingEntryModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface WaitingListEntry {
  id: number;
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
  estado: string;
  creado_en: string;
}

interface WaitingListData {
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

const ListaEsperaPage: React.FC = () => {
  const [isNewWaitingEntryModalOpen, setIsNewWaitingEntryModalOpen] = useState(false);
  const [waitingList, setWaitingList] = useState<WaitingListEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<WaitingListEntry | null>(null);

  useEffect(() => {
    fetchWaitingList();
  }, []);

  const fetchWaitingList = () => {
    axios
      .get(`${API_BASE_URL}/api/waiting-list`)
      .then((res) => {
        if (res.data.success) {
          setWaitingList(res.data.entries);
        } else {
          console.error('Error al cargar la lista de espera');
        }
      })
      .catch((err) => {
        console.error('Error axios lista de espera:', err);
      });
  };

  const handleCreateNewList = () => {
    setEditingEntry(null);
    setIsNewWaitingEntryModalOpen(true);
  };

  const handleEditEntry = (entry: WaitingListEntry) => {
    setEditingEntry(entry);
    setIsNewWaitingEntryModalOpen(true);
  };

  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta entrada?')) return;
    try {
      const res = await axios.delete(`${API_BASE_URL}/api/waiting-list/${id}`);
      if (res.data.success) {
        setWaitingList((prev) => prev.filter((entry) => entry.id !== id));
      } else {
        alert('Error al eliminar la entrada.');
      }
    } catch (error) {
      console.error('Error al eliminar entrada:', error);
      alert('Error al eliminar la entrada.');
    }
  };

  const handleNewWaitingEntrySubmit = async (data: WaitingListData) => {
    try {
      if (editingEntry) {
        // Editar existente
        const response = await axios.put(`${API_BASE_URL}/api/waiting-list/${editingEntry.id}`, data);
        if (response.data.success) {
          setWaitingList((prev) =>
            prev.map((entry) => (entry.id === editingEntry.id ? response.data.entry : entry))
          );
          setIsNewWaitingEntryModalOpen(false);
          setEditingEntry(null);
        } else {
          console.error('Error al actualizar entrada:', response.data.error);
          alert('Error al actualizar la entrada. Revisa la consola.');
        }
      } else {
        // Crear nuevo
        const response = await axios.post(`${API_BASE_URL}/api/waiting-list`, data);
        if (response.data.success) {
          setWaitingList((prev) => [response.data.entry, ...prev]);
          setIsNewWaitingEntryModalOpen(false);
        } else {
          console.error('Error al crear entrada:', response.data.error);
          alert('Error al crear la entrada. Revisa la consola.');
        }
      }
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Error al enviar datos al servidor.');
    }
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#F7F7ED', color: '#3C2022' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#CC5500' }}>
          Listas de Espera
        </h1>

        <button
          onClick={handleCreateNewList}
          className="px-6 py-3 rounded-lg shadow-md text-white font-semibold mb-8 transition-colors duration-300 bg-[#CC5500] hover:bg-[#FF6B00]"
        >
          Crear Nueva Lista de Espera
        </button>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          {waitingList.length === 0 ? (
            <p className="text-gray-600">No hay listas de espera activas.</p>
          ) : (
            waitingList.map((entry) => (
              <div
                key={entry.id}
                className="mt-4 border border-gray-300 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: '#FAF7F2' }}
              >
                <h2 className="text-2xl font-semibold mb-2" style={{ color: '#3C2022' }}>
                  {entry.nombre} {entry.apellido} -{' '}
                  <span className="text-orange-600">
                    {entry.invitados} invitado{entry.invitados !== 1 ? 's' : ''}
                  </span>
                </h2>
                <p className="text-sm text-gray-700 mb-1">
                  <strong>Fecha de reserva:</strong>{' '}
                  {new Date(entry.fecha_reserva).toLocaleString('es-CL', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}
                </p>
                {entry.telefono && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Teléfono:</strong> {entry.telefono}
                  </p>
                )}
                {entry.email && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Email:</strong> {entry.email}
                  </p>
                )}
                {entry.membership_id && (
                  <p className="text-sm text-gray-700 mb-1">
                    <strong># Membresía:</strong> {entry.membership_id}
                  </p>
                )}
                {entry.client_tags && entry.client_tags.length > 0 && (
                  <div className="mb-1">
                    <strong>Tags Cliente:</strong>{' '}
                    {entry.client_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {entry.reservation_tags && entry.reservation_tags.length > 0 && (
                  <div className="mb-1">
                    <strong>Tags Reserva:</strong>{' '}
                    {entry.reservation_tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full mr-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {entry.notas && (
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-line">
                    <strong>Notas:</strong> {entry.notas}
                  </p>
                )}
                <p className="text-sm font-semibold" style={{ color: '#CC5500' }}>
                  Estado: <span className="capitalize">{entry.estado}</span>
                </p>

                {/* Botones Editar y Eliminar */}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={() => handleEditEntry(entry)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <NewWaitingEntryModal
        isOpen={isNewWaitingEntryModalOpen}
        onClose={() => {
          setIsNewWaitingEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleNewWaitingEntrySubmit}
        initialData={editingEntry ?? undefined} // Asumiendo que tu modal acepta props para datos iniciales al editar
      />
    </div>
  );
};

export default ListaEsperaPage;
