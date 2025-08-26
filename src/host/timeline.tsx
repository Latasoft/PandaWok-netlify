import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Move } from 'lucide-react';
import ReservationDetailsPanel from '../components/ReservationDetailsPanel';
import NewReservationModal from '../components/NewReservationModal';
import BlockTableModal from '../components/BlockTableModal';
import AgregarMesaModal from '../components/NuevaMesaModal';
import WalkInModal from '../components/WalkInModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface Salon {
  id: number;
  nombre: string;
  capacidad: number;
  es_condicion_especial: boolean;
}

interface Mesa {
  id: number;
  salon_id: number;
  numero_mesa: string;
  tipo_mesa: string;
  tamanio: string;
  capacidad: number;
  esta_activa: boolean;
  posX?: number;
  posY?: number;
}

interface Reserva {
  id: number;
  cliente_id: number | null; // Si permites nulls para walk-in
  mesa_id: number;
  fecha_reserva: string;
  cantidad_personas: number;
  notas?: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  horario_id?: number;
  horario_descripcion?: string;
  status?: string; // 👉 AGREGA ESTA LÍNEA AQUÍ
}

interface BloqueoMesa {
  id: number;
  mesa_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
}

const generateTimeOptions = (): string[] => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return times;
};

const Timeline: React.FC = () => {
  const [salones, setSalones] = useState<Salon[]>([]);
  const [selectedSalonId, setSelectedSalonId] = useState<number | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);
  const [reservasMesa, setReservasMesa] = useState<Reserva[]>([]);
  const [reservaSeleccionada, setReservaSeleccionada] = useState<Reserva | null>(null);
  const [bloqueosMesa, setBloqueosMesa] = useState<BloqueoMesa[]>([]);
  const [bloqueoSeleccionado, setBloqueoSeleccionado] = useState<BloqueoMesa | null>(null);
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showBlockTableModal, setShowBlockTableModal] = useState(false);
  const [showAgregarMesaModal, setShowAgregarMesaModal] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'mesa' | 'todas'>('mesa');
  const [todasReservas, setTodasReservas] = useState<Reserva[]>([]);

  // Carga salones
  useEffect(() => {
    const fetchSalones = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/salones`);
        const salonesData = res.data.salones || res.data;
        setSalones(salonesData);
        if (salonesData.length > 0) setSelectedSalonId(salonesData[0].id);
      } catch (error) {
        console.error('Error cargando salones:', error);
      }
    };
    fetchSalones();
  }, []);

  const fetchReservasMesa = async () => {
    if (!mesaSeleccionada) return;

    try {
      const resReservas = await axios.get(`${API_BASE_URL}/api/reservas/mesa/${mesaSeleccionada.id}`, {
        params: { fecha: fechaSeleccionada },
        validateStatus: (status) => status === 200 || status === 404,
      });
      setReservasMesa(resReservas.status === 200 ? resReservas.data.reservas || [] : []);
      setReservaSeleccionada(null);
    } catch (error) {
      console.error('Error cargando reservas:', error);
      setReservasMesa([]);
    }
  };

  // Carga todas las reservas
const fetchTodasReservasPorFecha = async () => {
  try {
    console.log('Fetching reservas para fecha:', fechaSeleccionada); // Log fecha
    const response = await axios.get(`${API_BASE_URL}/api/reservas/byDate`, {
      params: { fecha: fechaSeleccionada }
    });
    console.log('Respuesta del servidor:', response.data); // Log respuesta
    setTodasReservas(response.data.reservas || []);
  } catch (error) {
    console.error('Error fetching todas las reservas:', error);
    setTodasReservas([]);
  }
};

  // Carga mesas cuando cambia el salón seleccionado
  useEffect(() => {
    if (!selectedSalonId) return;

    const fetchMesas = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/mesas/salon/${selectedSalonId}/mesas`);
        const mesasConPos = res.data.map((mesa: Mesa) => ({
          ...mesa,
          posX: typeof mesa.posX === 'number' && !isNaN(mesa.posX) ? mesa.posX : 50 + mesa.id * 5,
          posY: typeof mesa.posY === 'number' && !isNaN(mesa.posY) ? mesa.posY : 50 + mesa.id * 5,
        }));
        setMesas(mesasConPos);
        setMesaSeleccionada(null);
        setReservasMesa([]);
        setReservaSeleccionada(null);
        setBloqueosMesa([]);
        setBloqueoSeleccionado(null);
      } catch (error) {
        console.error('Error cargando mesas:', error);
        setMesas([]);
      }
    };
    fetchMesas();
  }, [selectedSalonId]);

  // Carga reservas y bloqueos cuando cambia la mesa o la fecha
  useEffect(() => {
    if (!mesaSeleccionada) {
      setReservasMesa([]);
      setBloqueosMesa([]);
      setReservaSeleccionada(null);
      setBloqueoSeleccionado(null);
      return;
    }

    const fetchReservasYBloqueos = async () => {
      try {
        const [resReservas, resBloqueos] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/reservas/mesa/${mesaSeleccionada.id}`, {
            params: { fecha: fechaSeleccionada },
            validateStatus: (status) => status === 200 || status === 404,
          }),
          axios.get(`${API_BASE_URL}/api/mesas/bloqueos/mesa/${mesaSeleccionada.id}`, {
            params: { fecha: fechaSeleccionada },
            validateStatus: (status) => status === 200 || status === 404,
          }),
        ]);
        setReservasMesa(resReservas.status === 200 ? resReservas.data.reservas || [] : []);
        setBloqueosMesa(resBloqueos.status === 200 ? resBloqueos.data.bloqueos || [] : []);
        setReservaSeleccionada(null);
        setBloqueoSeleccionado(null);
      } catch (error) {
        console.error('Error cargando reservas o bloqueos:', error);
        setReservasMesa([]);
        setBloqueosMesa([]);
      }
    };
    fetchReservasYBloqueos();
  }, [mesaSeleccionada, fechaSeleccionada]);

  // Mover mesa y guardar posición
  const handleDragEnd = async (mesaId: number, info: any) => {
    const { offset } = info;
    setMesas((prevMesas) =>
      prevMesas.map((mesa) => {
        if (mesa.id === mesaId) {
          const newPosX = (mesa.posX || 0) + offset.x;
          const newPosY = (mesa.posY || 0) + offset.y;

          axios
            .put(`${API_BASE_URL}/api/mesas/${mesaId}/posicion`, { posX: newPosX, posY: newPosY })
            .catch((err) => console.error('Error guardando posición:', err));

          return { ...mesa, posX: newPosX, posY: newPosY };
        }
        return mesa;
      })
    );
  };

  // Bloquear mesa
  const handleBlockTable = async (tableId: number, startTime: string, endTime: string, date: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/mesas/bloqueos/`, {
        mesa_id: tableId,
        fecha: date,
        hora_inicio: startTime,
        hora_fin: endTime,
      });
      alert('Mesa bloqueada correctamente');
      if (mesaSeleccionada) {
        setBloqueosMesa((prev) => [
          ...prev,
          { id: Date.now(), mesa_id: tableId, fecha: date, hora_inicio: startTime, hora_fin: endTime },
        ]);
      }
    } catch (error) {
      console.error('Error bloqueando mesa:', error);
      alert('Error bloqueando mesa. Intenta de nuevo.');
    }
  };

  // Desbloquear mesa
  const handleUnlockTable = async (bloqueoId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/api/mesas/bloqueos/${bloqueoId}/desbloquear`);
      alert('Bloqueo eliminado correctamente');
      setBloqueosMesa((prev) => prev.filter((b) => b.id !== bloqueoId));
      setBloqueoSeleccionado(null);
    } catch (error) {
      console.error('Error desbloqueando mesa:', error);
      alert('Error desbloqueando mesa. Intenta de nuevo.');
    }
  };

  // Agregar nueva mesa
  const handleAgregarMesa = async (mesaData: { salon_id: number; tipo_mesa: string; tamanio: string }) => {
    try {
      await axios.post(`${API_BASE_URL}/api/mesas`, mesaData);
      if (selectedSalonId) {
        const res = await axios.get(`${API_BASE_URL}/api/mesas/salon/${selectedSalonId}/mesas`);
        const mesasConPos = res.data.map((mesa: Mesa) => ({
          ...mesa,
          posX: typeof mesa.posX === 'number' && !isNaN(mesa.posX) ? mesa.posX : 50 + mesa.id * 5,
          posY: typeof mesa.posY === 'number' && !isNaN(mesa.posY) ? mesa.posY : 50 + mesa.id * 5,
        }));
        setMesas(mesasConPos);
      }
      setShowAgregarMesaModal(false);
    } catch (error) {
      console.error('Error agregando mesa:', error);
      alert('No se pudo agregar la mesa. Intenta de nuevo.');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Panel izquierdo */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-80 bg-[#FFF8E1] p-5 flex flex-col text-gray-800 shadow-lg rounded-lg"
      >
        {/* Tabs */}
        <div className="flex mb-4 bg-white rounded-lg overflow-hidden border border-orange-200">
          <button
            onClick={() => setActiveTab('mesa')}
            className={`flex-1 py-2 px-4 font-semibold text-sm transition ${
              activeTab === 'mesa'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-orange-50 text-gray-700'
            }`}
          >
            Mesa Actual
          </button>
          <button
            onClick={() => {
              setActiveTab('todas');
              fetchTodasReservasPorFecha();
            }}
            className={`flex-1 py-2 px-4 font-semibold text-sm transition ${
              activeTab === 'todas'
                ? 'bg-orange-500 text-white'
                : 'hover:bg-orange-50 text-gray-700'
            }`}
          >
            Todas
          </button>
        </div>

        <label htmlFor="fechaSeleccionada" className="mb-3 font-semibold text-lg text-[#3C2022]">
          Seleccionar Fecha
        </label>
        <input
          type="date"
          id="fechaSeleccionada"
          value={fechaSeleccionada}
          onChange={(e) => {
            setFechaSeleccionada(e.target.value);
            if (activeTab === 'todas') {
              fetchTodasReservasPorFecha();
            }
          }}
          className="mb-6 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        />

        {activeTab === 'mesa' ? (
          mesaSeleccionada ? (
            <>
              <h2 className="text-xl font-bold mb-4 text-[#3C2022]">
                Mesa {mesaSeleccionada.numero_mesa}
              </h2>

              {/* BLOQUEOS */}
              {bloqueosMesa.length > 0 ? (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-300 text-red-700 max-h-52 overflow-auto shadow-inner">
                  <h3 className="font-semibold mb-3 text-red-600 text-lg">Bloqueos</h3>
                  {bloqueosMesa.map((bloqueo) => (
                    <div
                      key={bloqueo.id}
                      className={`p-3 rounded-md border text-sm mb-3 cursor-pointer transition flex flex-col ${
                        bloqueoSeleccionado?.id === bloqueo.id
                          ? 'bg-red-200 border-red-500 shadow-md'
                          : 'bg-white border-red-200 hover:bg-red-100'
                      }`}
                      onClick={() => setBloqueoSeleccionado(bloqueo)}
                    >
                      <p className="font-semibold text-red-700">
                        🕒 {bloqueo.hora_inicio} - {bloqueo.hora_fin}
                      </p>
                      <p className="text-xs text-red-600">📅 {bloqueo.fecha}</p>
                    </div>
                  ))}

                  {bloqueoSeleccionado && (
                    <div className="mt-4 p-3 bg-red-100 rounded border border-red-400 text-sm shadow-inner">
                      <p><strong>Fecha:</strong> {bloqueoSeleccionado.fecha}</p>
                      <p><strong>Inicio:</strong> {bloqueoSeleccionado.hora_inicio}</p>
                      <p><strong>Fin:</strong> {bloqueoSeleccionado.hora_fin}</p>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleUnlockTable(bloqueoSeleccionado.id)}
                        className="mt-3 w-full py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-semibold"
                      >
                        Desbloquear Mesa
                      </motion.button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mb-6 text-gray-600 italic text-center">No hay bloqueos para esta fecha.</p>
              )}

              {/* RESERVAS */}
              {reservasMesa.length === 0 ? (
                <p className="text-gray-600 italic text-center mb-6">No hay reservas para esta fecha.</p>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-350px)] pr-1 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
                  {reservasMesa.map((reserva) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      key={reserva.id}
                      onClick={() => setReservaSeleccionada(reserva)}
                      className={`p-4 rounded-lg border shadow-sm cursor-pointer transition flex flex-col gap-1 ${
                        reservaSeleccionada?.id === reserva.id
                          ? 'bg-orange-100 border-orange-400 shadow-md'
                          : 'bg-white border-gray-300 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex justify-between items-center font-semibold text-[#3C2022] text-base">
                        <span>👤 {reserva.cliente_nombre} {reserva.cliente_apellido}</span>
                        {reserva.status === 'sentado' && (
                          <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                            Sentado
                          </span>
                        )}
                      </div>
                      <div className="text-gray-700 text-sm font-medium">👥 {reserva.cantidad_personas} personas</div>
                      {reserva.horario_descripcion && (
                        <div className="text-gray-600 text-sm">🕐 {reserva.horario_descripcion}</div>
                      )}
                      {reserva.notas && (
                        <div className="text-gray-500 italic text-sm truncate">📝 {reserva.notas}</div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* BOTONES */}
              <div className="mt-auto space-y-3 pt-6">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowNewReservationModal(true)}
                  className="w-full py-3 bg-orange-500 text-white rounded-md font-semibold shadow hover:bg-orange-600 transition"
                >
                  + Nueva reserva
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBlockTableModal(true)}
                  className="w-full py-3 bg-red-500 text-white rounded-md font-semibold shadow hover:bg-red-600 transition"
                >
                  Bloquear Mesa
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!mesaSeleccionada) {
                      alert('Selecciona una mesa primero.');
                      return;
                    }
                    setShowWalkInModal(true);
                  }}
                  className="w-full py-3 bg-blue-500 text-white rounded-md font-semibold shadow hover:bg-blue-600 transition"
                >
                  Sentar Walk-in
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={async () => {
                    if (!mesaSeleccionada) return;
                    if (!window.confirm(`¿Eliminar mesa ${mesaSeleccionada.numero_mesa}? Esta acción no se puede deshacer.`)) return;
                    try {
                      await axios.delete(`${API_BASE_URL}/api/mesas/${mesaSeleccionada.id}`);
                      alert('Mesa eliminada correctamente');
                      if (selectedSalonId) {
                        const res = await axios.get(`${API_BASE_URL}/api/mesas/salon/${selectedSalonId}/mesas`);
                        const mesasConPos = res.data.map((mesa: Mesa) => ({
                          ...mesa,
                          posX: typeof mesa.posX === 'number' && !isNaN(mesa.posX) ? mesa.posX : 50 + mesa.id * 5,
                          posY: typeof mesa.posY === 'number' && !isNaN(mesa.posY) ? mesa.posY : 50 + mesa.id * 5,
                        }));
                        setMesas(mesasConPos);
                      }
                      setMesaSeleccionada(null);
                    } catch (error) {
                      console.error('Error eliminando mesa:', error);
                      alert('No se pudo eliminar la mesa. Intenta de nuevo.');
                    }
                  }}
                  className="w-full py-3 bg-red-700 text-white rounded-md font-semibold shadow hover:bg-red-800 transition"
                >
                  Eliminar Mesa
                </motion.button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center mt-8 italic">
              Selecciona una mesa para ver reservas
            </p>
          )
        ) : (
          // Todas las reservas content
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
            <h2 className="text-xl font-bold mb-4 text-[#3C2022]">
              Todas las Reservas
            </h2>
            {todasReservas.length === 0 ? (
              <p className="text-gray-600 italic text-center mb-6">No hay reservas para esta fecha.</p>
            ) : (
              todasReservas.map((reserva) => (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={reserva.id}
                  onClick={() => setReservaSeleccionada(reserva)}
                  className={`p-4 rounded-lg border shadow-sm cursor-pointer transition flex flex-col gap-1 ${
                    reservaSeleccionada?.id === reserva.id
                      ? 'bg-orange-100 border-orange-400 shadow-md'
                      : 'bg-white border-gray-300 hover:bg-orange-50'
                  }`}
                >
                  <div className="flex justify-between items-center font-semibold text-[#3C2022] text-base">
                    <span>👤 {reserva.cliente_nombre} {reserva.cliente_apellido}</span>
                    {reserva.status === 'sentado' && (
                      <span className="ml-2 bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                        Sentado
                      </span>
                    )}
                  </div>
                  <div className="text-gray-700 text-sm font-medium">👥 {reserva.cantidad_personas} personas</div>
                  {reserva.horario_descripcion && (
                    <div className="text-gray-600 text-sm">🕐 {reserva.horario_descripcion}</div>
                  )}
                  {reserva.notas && (
                    <div className="text-gray-500 italic text-sm truncate">📝 {reserva.notas}</div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </motion.aside>

      {/* Main */}
      <main className="flex-1 p-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Salones y Mesas</h1>
          {/* Tabs de Salones */}
          <div className="mb-4 border-b border-gray-300">
            <nav className="flex space-x-4 overflow-x-auto">
              {salones.map((salon) => (
                <button
                  key={salon.id}
                  onClick={() => setSelectedSalonId(salon.id)}
                  className={`py-2 px-4 whitespace-nowrap rounded-t-lg font-semibold ${
                    selectedSalonId === salon.id
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-gray-600 hover:text-orange-600'
                  } transition`}
                  title={`Capacidad: ${salon.capacidad}${salon.es_condicion_especial ? ' (Condición especial)' : ''}`}
                >
                  {salon.nombre}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAgregarMesaModal(true)}
              className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition shadow"
            >
              Nueva Mesa
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full shadow ${
                isEditMode ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              } transition`}
            >
              <Move className="w-5 h-5" />
              {isEditMode ? 'Modo mover activo' : 'Mover Mesas'}
            </motion.button>
          </div>
        </div>

        <div ref={containerRef} className="relative w-full h-[calc(100vh-160px)] bg-white rounded shadow p-4">
          {mesas.map((mesa) => {
            const bloqueosDeMesa = bloqueosMesa.filter((b) => b.mesa_id === mesa.id);

            return (
              <motion.div
                key={mesa.id}
                drag={isEditMode}
                dragConstraints={containerRef}
                whileDrag={{ scale: 1.1, zIndex: 100 }}
                whileHover={{ scale: 1.05 }}
                onDragEnd={(event, info) => handleDragEnd(mesa.id, info)}
                onClick={() => {
                  setMesaSeleccionada(mesa);
                  setReservaSeleccionada(null);
                  setBloqueoSeleccionado(null);
                }}
                className={`absolute flex flex-col items-center justify-center text-gray-900 font-semibold shadow cursor-pointer ${
                  mesa.tipo_mesa === 'redonda'
                    ? 'rounded-full'
                    : mesa.tipo_mesa === 'cuadrada'
                    ? 'rounded'
                    : 'rounded-md'
                }`}
                style={{
                  width: mesa.tamanio === 'pequeña' ? 50 : mesa.tamanio === 'mediana' ? 70 : 90,
                  height: mesa.tamanio === 'pequeña' ? 50 : mesa.tamanio === 'mediana' ? 70 : 90,
                  backgroundColor:
                    mesaSeleccionada?.id === mesa.id
                      ? '#F97316'
                      : bloqueosDeMesa.length > 0
                      ? '#FCA5A5'
                      : '#F3E8D9',
                  border: '3px dashed #D97706',
                  top: 0,
                  left: 0,
                }}
                animate={{ x: mesa.posX || 0, y: mesa.posY || 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="text-sm">{mesa.numero_mesa}</div>
                {bloqueosDeMesa.length > 0 && (
                  <div className="text-xs text-red-700 mt-1">Bloqueada</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Modales */}
      {reservaSeleccionada && reservaSeleccionada.id && (
        <ReservationDetailsPanel
          reservaId={reservaSeleccionada.id}
          onClose={() => setReservaSeleccionada(null)}
          onReservaFinalizada={() => {
            console.log('Reserva finalizada');
          }}
        />
      )}

      {showNewReservationModal && mesaSeleccionada && (
        <NewReservationModal
          isOpen={showNewReservationModal}
          onClose={() => setShowNewReservationModal(false)}
          tableId={mesaSeleccionada.id}
          onReservationCreate={(newRes) => {
            setReservaSeleccionada(newRes);
            setShowNewReservationModal(false);
          }}
        />
      )}

      {showBlockTableModal && mesaSeleccionada && (
        <BlockTableModal
          isOpen={showBlockTableModal}
          onClose={() => setShowBlockTableModal(false)}
          tableId={mesaSeleccionada.id}
          currentSalonName={salones.find((s) => s.id === selectedSalonId)?.nombre || ''}
          generateTimeOptions={generateTimeOptions}
          fechaSeleccionada={fechaSeleccionada}
          onBlock={(tableId, startTime, endTime, fecha) => {
            handleBlockTable(tableId, startTime, endTime, fecha);
            setShowBlockTableModal(false);
          }}
        />
      )}

      {showWalkInModal && mesaSeleccionada && (
        <WalkInModal
          mesaId={mesaSeleccionada.id}
          mesaNumero={mesaSeleccionada.numero_mesa}
          fechaSeleccionada={fechaSeleccionada}
          onClose={() => setShowWalkInModal(false)}
          onReservaCreada={(nuevaReserva) => {
            setReservasMesa((prev) => [...prev, nuevaReserva]);
            setReservaSeleccionada(nuevaReserva);
            setShowWalkInModal(false);
          }}
        />
      )}

      {showAgregarMesaModal && (
        <AgregarMesaModal
          salones={salones}
          onClose={() => setShowAgregarMesaModal(false)}
          onAgregar={handleAgregarMesa}
        />
      )}
    </div>
  );

};

export default Timeline;
