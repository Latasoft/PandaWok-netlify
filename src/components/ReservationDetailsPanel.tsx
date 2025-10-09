import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Calendar, Clock, Users, StickyNote, MapPin, Upload,
  Tag, X, Send, TicketCheck, Trash, CheckCircle
} from 'lucide-react';
import ClientTagsModal from './ClientTagsModal';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Función para generar descripción de horario
const generateHorarioDescripcion = (horarioId: number | null | undefined): string => {
  if (!horarioId) return 'Sin horario';
  const startHour = 12 + Math.ceil((horarioId - 1) / 2);
  const startMinute = horarioId % 2 === 1 ? 30 : 0;
  const endHour = startMinute === 30 ? startHour + 1 : startHour;
  const endMinute = startMinute === 30 ? 0 : 30;
  return `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
};

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  correo_electronico?: string;
  telefono?: string;
}

interface Reserva {
  id: number;
  cliente_id: number | null;
  mesa_id: number;
  fecha_reserva: string;
  cantidad_personas: number;
  notas?: string;
  horario_descripcion?: string;
  horario_id?: number; // Agregar este campo
  cliente?: Cliente;
  mesa_numero?: string;
  duracion?: number;
  origen?: string;
  fecha_creacion?: string;
  tags?: string[];
  status?: string;
}

interface Props {
  reservaId: number;
  onClose: () => void;
  onReservaFinalizada: () => void;
}

const ReservationDetailsPanel: React.FC<Props> = ({ reservaId, onClose, onReservaFinalizada }) => {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'reservas' | 'perfil' | 'actividad' | 'historial'>('reservas');
  const [perfilData, setPerfilData] = useState({
    nombre: '',
    apellido: '',
    cumpleanos: '',
    empresa: '',
    telefono: '',
    email: '',
    membresiaNumero: '',
    membresiaNivel: '',
    notasPerfil: '',
    suscrito: false,
    tagsCliente: [] as string[],
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [historial, setHistorial] = useState<Reserva[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Función para obtener la descripción del horario (backend o frontend)
  const getHorarioDescripcion = (reservaData: Reserva): string => {
    // Si viene del backend, usarlo
    if (reservaData.horario_descripcion) {
      return reservaData.horario_descripcion;
    }
    // Si no, generarlo en frontend
    return generateHorarioDescripcion(reservaData.horario_id);
  };

  useEffect(() => {
    const fetchReservaYHistorial = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE_URL}/api/reservas/${reservaId}`);
        const data = res.data.reserva || res.data;
        
        // 🔍 Log para debuggear los datos de la reserva
        console.log('🔍 [RESERVA DEBUG] Datos completos recibidos:', {
          reserva_completa: data,
          horario_id: data.horario_id,
          horario_descripcion: data.horario_descripcion,
          horario_generado: generateHorarioDescripcion(data.horario_id),
          fecha_reserva: data.fecha_reserva,
          timestamp: new Date().toISOString()
        });
        
        setReserva(data);
        setSelectedTags(data.tags || []);

        if (data.cliente_id) {
          // Cargar historial solo si hay cliente_id
          const historialRes = await axios.get(`${API_BASE_URL}/api/reservas/cliente/${data.cliente_id}/historial`);
          setHistorial(historialRes.data.historial || []);
        } else {
          setHistorial([]);
        }
      } catch (error) {
        console.error('Error al cargar reserva o historial:', error);
        setHistorial([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservaYHistorial();
  }, [reservaId]);


  useEffect(() => {
    if (reserva?.cliente) {
      setPerfilData({
        nombre: reserva.cliente.nombre || '',
        apellido: reserva.cliente.apellido || '',
        cumpleanos: '',
        empresa: '',
        telefono: reserva.cliente.telefono || '',
        email: reserva.cliente.correo_electronico || '',
        membresiaNumero: '',
        membresiaNivel: '',
        notasPerfil: reserva.notas || '',
        suscrito: false,
        tagsCliente: reserva.tags || [],
      });
    } else {
      setPerfilData({
        nombre: '',
        apellido: '',
        cumpleanos: '',
        empresa: '',
        telefono: '',
        email: '',
        membresiaNumero: '',
        membresiaNivel: '',
        notasPerfil: '',
        suscrito: false,
        tagsCliente: [],
      });
    }
  }, [reserva]);

  useEffect(() => {
    if (reserva) {
      setSelectedTags(reserva.tags || []);
    }
  }, [reserva, isTagsModalOpen]);

  const handlePerfilChange = (field: keyof typeof perfilData, value: string | boolean) => {
    setPerfilData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const fetchHistorial = async (clienteId: number) => {
    setLoadingHistorial(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/reservas/cliente/${clienteId}/historial`);
      setHistorial(res.data.historial || []);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoadingHistorial(false);
    }
  };
  const tabs: Array<'reservas' | 'perfil' | 'actividad' | 'historial'> = ['reservas', 'perfil', 'actividad', 'historial'];

  const handleFinalizarReserva = async () => {
    if (!reserva) return;

    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_reserva);

    // Si tienes la hora en horario_descripcion (ejemplo "18:30")
    if (reserva.horario_descripcion) {
      const [hora, minuto] = reserva.horario_descripcion.split(':');
      fechaReserva.setHours(Number(hora));
      fechaReserva.setMinutes(Number(minuto));
    }

    if (fechaReserva > ahora) {
      alert('La reserva aún no ha pasado. No se puede finalizar.');
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/reservas/${reserva.id}`);
      alert('Reserva finalizada y eliminada.');
      onClose(); // cierra el panel
    } catch (error) {
      console.error('Error al finalizar la reserva:', error);
      alert('Error al finalizar la reserva.');
    }
};
  const handleSentar = async () => {
    if (!reserva) return;
    setActionLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/reservas/${reserva.id}/sentar`);
      setReserva(res.data.reserva);
      alert('Reserva marcada como sentada');
    } catch (error) {
      console.error('Error al sentar la reserva:', error);
      alert('Error al marcar como sentada');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (nuevoEstado: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/reservas/${reservaId}/estado`, {
        estado: nuevoEstado
      });
      onReservaFinalizada(); // Esto disparará la recarga
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error actualizando estado de la reserva');
    }
  };

  // Función para formatear fecha con date-fns
  const formatearFechaSegura = (fechaString: string): string => {
    try {
      const fecha = parseISO(fechaString);
      return format(fecha, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return fechaString; // fallback si hay error
    }
  };

  if (loading || !reserva) {
    return (
      <div className="fixed top-0 right-0 w-1/2 max-w-[700px] h-full bg-white p-6 shadow-lg border-l z-50 flex items-center justify-center">
        <p className="text-gray-600">Cargando reserva...</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed top-0 right-0 w-full md:w-1/2 max-w-[700px] h-full bg-gradient-to-b from-yellow-50 to-white p-8 border-l border-yellow-300 shadow-2xl z-50 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-yellow-800">{reserva.cliente?.nombre} {reserva.cliente?.apellido}</h2>
            <p className="text-xs text-gray-600">Origen: {reserva.origen || 'Web'}</p>
            <p className="text-xs text-gray-500">Creada el {reserva.fecha_creacion ? formatearFechaSegura(reserva.fecha_creacion) : new Date().toLocaleDateString()}</p>
            {/* Agregar la hora de la reserva aquí */}
            <p className="text-xs text-gray-600">Hora: {getHorarioDescripcion(reserva)}</p>

            {/* Tabs */}
            <div className="flex gap-6 mt-3 text-sm text-yellow-900 border-b pb-2">
              {tabs.map(tab => {
                const isActive = activeTab === tab;
                return (
                  <motion.button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-1 font-semibold transition-colors duration-300 ${
                      isActive ? 'text-yellow-600' : 'text-yellow-900 hover:text-yellow-400'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {isActive && (
                      <motion.div
                        layoutId="underline"
                        className="h-0.5 bg-yellow-500 rounded mt-1"
                        style={{ width: '100%' }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>

          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition duration-300">
            <X />
          </button>
        </div>

        {/* Tab: Reservas */}
        {activeTab === 'reservas' && (
          <div className="space-y-4 text-base text-gray-800">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800 font-medium">Fecha: {formatearFechaSegura(reserva.fecha_reserva)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Hora: {getHorarioDescripcion(reserva)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-pink-600" />
              <span className="text-pink-800 font-medium">Personas: {reserva.cantidad_personas}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <span className="text-purple-800 font-medium">Duración: {reserva.duracion || 3}h</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Mesa: [Salón 1 (A)] {reserva.mesa_numero || reserva.mesa_id}</span>
            </div>
            <div className="flex items-center gap-3">
              <StickyNote className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Notas: {reserva.notas || 'Sin notas'}</span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsTagsModalOpen(true)}>
              <Tag className="w-5 h-5 text-yellow-600" />
              <span className="italic text-gray-500 hover:text-yellow-600 transition">
                {selectedTags.length > 0 ? selectedTags.join(', ') : '+ Toca para agregar tags'}
              </span>
            </div>
          </div>
        )}

        {/* Tab: Perfil */}
        {activeTab === 'perfil' && (
          <div className="text-gray-700">
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Nombre</label>
                <input
                  type="text"
                  placeholder="Nombre"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.nombre}
                  onChange={e => handlePerfilChange('nombre', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Apellido</label>
                <input
                  type="text"
                  placeholder="Apellido"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.apellido}
                  onChange={e => handlePerfilChange('apellido', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Cumpleaños</label>
                <input
                  type="date"
                  placeholder="Cumpleaños"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.cumpleanos}
                  onChange={e => handlePerfilChange('cumpleanos', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Empresa</label>
                <input
                  type="text"
                  placeholder="Empresa"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.empresa}
                  onChange={e => handlePerfilChange('empresa', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.telefono}
                  onChange={e => handlePerfilChange('telefono', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.email}
                  onChange={e => handlePerfilChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-1 font-semibold text-yellow-900"># Membresía</label>
                <input
                  type="text"
                  placeholder="# Membresía"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.membresiaNumero}
                  onChange={e => handlePerfilChange('membresiaNumero', e.target.value)}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-yellow-900">Nivel de membresía</label>
                <input
                  type="text"
                  placeholder="Nivel de membresía"
                  className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={perfilData.membresiaNivel}
                  onChange={e => handlePerfilChange('membresiaNivel', e.target.value)}
                />
              </div>
              <div></div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-yellow-900">Tags del cliente</label>
              <div
                className="bg-yellow-100 p-3 rounded cursor-pointer text-yellow-600 hover:text-yellow-800 transition"
                onClick={() => setIsTagsModalOpen(true)}
              >
                {perfilData.tagsCliente.length > 0
                  ? perfilData.tagsCliente.join(', ')
                  : '+ Toca para agregar tags'}
              </div>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-semibold text-yellow-900">Nota del perfil</label>
              <textarea
                placeholder="Escribe una nota"
                className="w-full bg-yellow-100 p-2 rounded text-yellow-900 placeholder-yellow-400 resize-none border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                rows={3}
                value={perfilData.notasPerfil}
                onChange={e => handlePerfilChange('notasPerfil', e.target.value)}
              />
            </div>

            <div className="mb-6 flex items-center gap-3">
              <input
                type="checkbox"
                checked={perfilData.suscrito}
                onChange={e => handlePerfilChange('suscrito', e.target.checked)}
                id="suscrito-lista"
                className="accent-yellow-500"
              />
              <label htmlFor="suscrito-lista" className="select-none text-yellow-900">
                Suscrito a lista de correo
              </label>
            </div>
          </div>
        )}

        {/* Tab: Actividad */}
        {activeTab === 'actividad' && (
          <div className="space-y-4">
            {reserva.cliente ? (
              <div className="bg-yellow-900 text-yellow-100 rounded p-4 flex flex-col gap-2">
                <p className="text-sm">
                  <span className="font-bold">Nombre:</span> {reserva.cliente.nombre} {reserva.cliente.apellido}
                </p>
                <p className="text-sm">
                  <span className="font-bold">Correo:</span> {reserva.cliente.correo_electronico || 'No disponible'}
                </p>
                <p className="text-sm text-yellow-300">Origen: {reserva.origen || 'Web'}</p>
              </div>
            ) : (
              <div className="bg-yellow-900 text-yellow-100 rounded p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold">Walkin</p>
                <p className="text-sm text-yellow-300">Origen: {reserva.origen || 'Restaurant'}</p>
              </div>
            )}

            <div className="text-xs text-yellow-700">
              Última actualización: {reserva.fecha_creacion ? formatearFechaSegura(reserva.fecha_creacion) : 'No disponible'}
            </div>
          </div>
        )}

        {/* Tab: Historial */}
        {activeTab === 'historial' && (
          <div className="p-4">
            {loadingHistorial ? (
              <p>Cargando historial...</p>
            ) : historial.length === 0 ? (
              <p className="text-yellow-900 italic">No hay historial de reservas para este cliente.</p>
            ) : (
              <table className="w-full text-sm text-left text-yellow-900 border border-yellow-400 rounded">
                <thead className="bg-yellow-200">
                  <tr>
                    <th className="px-4 py-2 border border-yellow-300">Fecha</th>
                    <th className="px-4 py-2 border border-yellow-300">Mesa</th>
                    <th className="px-4 py-2 border border-yellow-300">Personas</th>
                    <th className="px-4 py-2 border border-yellow-300">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((res) => (
                    <tr key={res.id} className="hover:bg-yellow-100">
                      <td className="px-4 py-2 border border-yellow-300">
                        {formatearFechaSegura(res.fecha_reserva)}
                      </td>
                      <td className="px-4 py-2 border border-yellow-300">
                        {res.mesa_numero || res.mesa_id}
                      </td>
                      <td className="px-4 py-2 border border-yellow-300">
                        {res.cantidad_personas}
                      </td>
                      <td className="px-4 py-2 border border-yellow-300">
                        {res.notas || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="mt-8 flex flex-col gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={actionLoading || reserva.status === 'sentado'}
            onClick={handleSentar}
            className={`flex items-center justify-center gap-2 rounded-md py-3 px-4 text-white transition-all duration-300 ${
              reserva.status === 'sentado' ? 'bg-green-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <CheckCircle className="w-5 h-5" /> {reserva.status === 'sentado' ? 'Sentado' : 'Sentar'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-purple-600 text-white rounded-md py-3 px-4 hover:bg-purple-700 transition-all duration-300"
          >
            <Send className="w-5 h-5" /> Enviar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 bg-yellow-500 text-white rounded-md py-3 px-4 hover:bg-yellow-600 transition-all duration-300"
          >
            <TicketCheck className="w-5 h-5" /> Redimir código
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFinalizarReserva}
            className="flex items-center justify-center gap-2 bg-red-600 text-white rounded-md py-3 px-4 hover:bg-red-700 transition-all duration-300"
          >
            <Trash className="w-5 h-5" /> Finalizar Reserva
          </motion.button>
        </div>

      </div>

      {/* Modal Tags */}
      <ClientTagsModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        onSaveTags={(tags) => {
          setSelectedTags(tags);
          setPerfilData(prev => ({ ...prev, tagsCliente: tags }));
        }}
        initialSelectedTags={selectedTags}
      />
    </>
  );

};

export default ReservationDetailsPanel;
