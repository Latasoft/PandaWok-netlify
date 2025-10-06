import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Move, X } from 'lucide-react';
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
  cliente_id: number | null;
  mesa_id: number;
  fecha_reserva: string;
  cantidad_personas: number;
  notas?: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  horario_id?: number;
  horario_descripcion?: string;
  status?: string;
  numero_mesa?: string;
  salon_nombre?: string;
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

const sortReservasByHorario = (reservas: Reserva[], order: 'asc' | 'desc' = 'asc') => {
  return [...reservas].sort((a, b) => {
    // Extract hours from horario_descripcion (format: "HH:MM - HH:MM")
    const timeA = a.horario_descripcion?.split(' - ')[0] || '99:99';
    const timeB = b.horario_descripcion?.split(' - ')[0] || '99:99';
    return order === 'asc' ? timeA.localeCompare(timeA) : timeB.localeCompare(timeB);
  });
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
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  type TabType = 'mesa' | 'todas';
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>('mesa');
  const [todasReservas, setTodasReservas] = useState<Reserva[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(new Date().toISOString().split('T')[0]);
  const pendingScrollIdRef = useRef<string | null>(null);
  const [sortOrder] = useState<'asc' | 'desc'>('asc');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Leer query params (t, fecha) al montar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('t');
    const fecha = params.get('fecha');
    if (fecha) {
      setFechaSeleccionada(fecha);
    }
    if (tab === 'todas') {
      setActiveTab('todas');
      fetchTodasReservasPorFecha();
    }
    // Si hay hash #reserva-<id> guardarlo para scroll posterior
    if (location.hash.startsWith('#reserva-')) {
      pendingScrollIdRef.current = location.hash.substring(1); // remove '#'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hacer scroll a la reserva si está en la lista de "todas"
  useEffect(() => {
    if (activeTab === 'todas' && pendingScrollIdRef.current) {
      const el = document.getElementById(pendingScrollIdRef.current);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2','ring-orange-500','transition');
        setTimeout(() => {
          el.classList.remove('ring-2','ring-orange-500');
        }, 3000);
        pendingScrollIdRef.current = null;
      }
    }
  }, [activeTab, todasReservas]);

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

  // Escuchar cambios en el parámetro 'fecha' de la URL para sincronizar con el header del layout
  useEffect(() => {
    const fechaParam = searchParams.get('fecha');
    if (fechaParam && fechaParam !== fechaSeleccionada) {
      console.log('📅 [TIMELINE - URL PARAM CHANGE] Detectando cambio de fecha desde URL:', {
        fechaAnterior: fechaSeleccionada,
        fechaNueva: fechaParam,
        timestamp: new Date().toISOString()
      });
      setFechaSeleccionada(fechaParam);
      // No necesitamos llamar updateURLWithDate aquí porque ya viene de la URL
    }
  }, [searchParams, fechaSeleccionada]);

  // Mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Leer query params (t, fecha) al montar
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('t');
    const fecha = params.get('fecha');
    if (fecha) {
      setFechaSeleccionada(fecha);
    }
    if (tab === 'todas') {
      setActiveTab('todas');
      fetchTodasReservasPorFecha();
    }
    // Si hay hash #reserva-<id> guardarlo para scroll posterior
    if (location.hash.startsWith('#reserva-')) {
      pendingScrollIdRef.current = location.hash.substring(1); // remove '#'
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hacer scroll a la reserva si está en la lista de "todas"
  useEffect(() => {
    if (activeTab === 'todas' && pendingScrollIdRef.current) {
      const el = document.getElementById(pendingScrollIdRef.current);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2','ring-orange-500','transition');
        setTimeout(() => {
          el.classList.remove('ring-2','ring-orange-500');
        }, 3000);
        pendingScrollIdRef.current = null;
      }
    }
  }, [activeTab, todasReservas]);

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

  // Función auxiliar para actualizar la URL con la nueva fecha
  const updateURLWithDate = (newDate: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('fecha', newDate);
    setSearchParams(params);
    console.log('📅 [TIMELINE - URL UPDATE] Actualizando URL con nueva fecha:', {
      fechaNueva: newDate,
      paramsActualizados: params.toString(),
      timestamp: new Date().toISOString()
    });
  };

  const fetchReservasMesa = useCallback(async () => {
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
  }, [mesaSeleccionada, fechaSeleccionada]);

  // Carga todas las reservas
  const fetchTodasReservasPorFecha = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/reservas/byDate`, {
        params: { fecha: fechaSeleccionada }
      });
      
      // 🔍 Log para debuggear las reservas del día
      console.log('🔍 [TODAS RESERVAS DEBUG] Datos recibidos:', {
        total_reservas: response.data.reservas?.length || 0,
        fecha: fechaSeleccionada,
        primeras_3_reservas: response.data.reservas?.slice(0, 3).map((r: Reserva) => ({
          id: r.id,
          cliente: `${r.cliente_nombre} ${r.cliente_apellido}`,
          horario_id: r.horario_id,
          horario_descripcion: r.horario_descripcion,
          fecha_reserva: r.fecha_reserva
        })),
        timestamp: new Date().toISOString()
      });
      
      // Sort reservas before setting state
      const sortedReservas = sortReservasByHorario(response.data.reservas || [], sortOrder);
      setTodasReservas(sortedReservas);
    } catch (error) {
      console.error('Error fetching todas las reservas:', error);
      setTodasReservas([]);
    }
  }, [fechaSeleccionada, sortOrder]);

  // Refrescar datos cuando cambia el tab activo
  useEffect(() => {
    const refreshActiveTab = async () => {
      if (activeTab === 'todas') {
        await fetchTodasReservasPorFecha();
      } else if (activeTab === 'mesa' && mesaSeleccionada) {
        await fetchReservasMesa();
      }
    };
    refreshActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Refrescar datos cuando cambia el tab activo
  useEffect(() => {
    const refreshActiveTab = async () => {
      if (activeTab === 'todas') {
        await fetchTodasReservasPorFecha();
      } else if (activeTab === 'mesa' && mesaSeleccionada) {
        await fetchReservasMesa();
      }
    };
    refreshActiveTab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Refrescar reservas cuando cambia la fecha - mantener ambos tabs actualizados
  useEffect(() => {
    const refreshData = async () => {
      // Siempre refrescar todas las reservas para mantener datos actualizados en ambos tabs
      await fetchTodasReservasPorFecha();
      
      // También recargar reservas de mesa si hay una seleccionada
      if (mesaSeleccionada) {
        await fetchReservasMesa();
      }
    };
    refreshData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fechaSeleccionada]);
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
        
        const reservasData = resReservas.status === 200 ? resReservas.data.reservas || [] : [];
        const bloqueosData = resBloqueos.status === 200 ? resBloqueos.data.bloqueos || [] : [];
        
        // 🔍 Log detallado de reservas de la mesa
        console.log('🔍 [RESERVAS MESA DEBUG] Datos recibidos:', {
          mesa_id: mesaSeleccionada.id,
          mesa_numero: mesaSeleccionada.numero_mesa,
          fecha: fechaSeleccionada,
          total_reservas: reservasData.length,
          reservas_detalle: reservasData.map((r: Reserva) => ({
            id: r.id,
            cliente: `${r.cliente_nombre} ${r.cliente_apellido}`,
            horario_id: r.horario_id,
            horario_descripcion: r.horario_descripcion,
            fecha_reserva: r.fecha_reserva,
            cantidad_personas: r.cantidad_personas
          })),
          timestamp: new Date().toISOString()
        });
        
        setReservasMesa(reservasData);
        setBloqueosMesa(bloqueosData);
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
  const handleDragEnd = async (mesaId: number, info: { offset: { x: number; y: number } }) => {
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

  // Primero, agregar la función de recarga
const reloadReservas = async () => {
  try {
    const responseTodasReservas = await axios.get(`${API_BASE_URL}/api/reservas/byDate`, {
      params: { fecha: fechaSeleccionada }
    });
    // Sort reservas before setting state
    const sortedReservas = sortReservasByHorario(responseTodasReservas.data.reservas || [], sortOrder);
    setTodasReservas(sortedReservas);
    
    if (mesaSeleccionada) {
      const responseMesaReservas = await axios.get(`${API_BASE_URL}/api/reservas/mesa/${mesaSeleccionada.id}`, {
        params: { fecha: fechaSeleccionada }
      });
      setReservasMesa(responseMesaReservas.data.reservas || []);
    }
    
    // Recargar las mesas para mantener sincronización
    if (selectedSalonId) {
      const res = await axios.get(`${API_BASE_URL}/api/mesas/salon/${selectedSalonId}/mesas`);
      const mesasConPos = res.data.map((mesa: Mesa) => ({
        ...mesa,
        posX: typeof mesa.posX === 'number' && !isNaN(mesa.posX) ? mesa.posX : 50 + mesa.id * 5,
        posY: typeof mesa.posY === 'number' && !isNaN(mesa.posY) ? mesa.posY : 50 + mesa.id * 5,
      }));
      setMesas(mesasConPos);
    }
  } catch (error) {
    console.error('Error recargando reservas:', error);
  }
};

  // Efecto para actualizar el estado cuando hay cambios
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'todas') {
        fetchTodasReservasPorFecha();
      } else if (mesaSeleccionada) {
        fetchReservasMesa();
      }
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [activeTab, mesaSeleccionada, fetchTodasReservasPorFecha, fetchReservasMesa]);

  // Define default mesa (first table in first salon)
  const defaultMesa = mesas.find(m => m.salon_id === salones[0]?.id) || null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      
      <div className="flex flex-1 md:flex-row overflow-hidden">


      {/* Desktop Sidebar */}
      <aside
        className={`
          ${isMobile ? 'hidden' : 'relative'}
          w-80 bg-[#FFF8E1] flex flex-col text-gray-800 shadow-lg h-screen
        `}
      >
        {!isMobile && (
          <>
            {/* Tabs */}
            <div className="flex mb-4 bg-white rounded-lg overflow-hidden border border-orange-200">
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
            </div>
            <label htmlFor="fechaSeleccionada" className="mb-3 font-semibold text-lg text-[#3C2022]">
              Seleccionar Fecha
            </label>
            <input
              type="date"
              id="fechaSeleccionada"
              value={fechaSeleccionada}
              onChange={(e) => {
                console.log('📅 [SIDEBAR DATE CHANGE] Fecha cambiada desde el sidebar:', {
                  fechaAnterior: fechaSeleccionada,
                  fechaNueva: e.target.value,
                  mesaSeleccionada: mesaSeleccionada ? {
                    id: mesaSeleccionada.id,
                    numero: mesaSeleccionada.numero_mesa
                  } : null,
                  activeTab: activeTab,
                  timestamp: new Date().toISOString()
                });
                setFechaSeleccionada(e.target.value);
                // Actualizar la URL con la nueva fecha
                updateURLWithDate(e.target.value);
                // Refrescar ambos tabs cuando cambia la fecha
                if (activeTab === 'todas') {
                  fetchTodasReservasPorFecha();
                } else if (activeTab === 'mesa' && mesaSeleccionada) {
                  fetchReservasMesa();
                }
              }}
              className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />

            {/* Desktop Content */}
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
                    </div>
                  ) : (
                    <p className="mb-6 text-gray-600 italic text-center">No hay bloqueos para esta fecha.</p>
                  )}

                  {/* RESERVAS */}
                  {reservasMesa.length === 0 ? (
                    <p className="text-gray-600 italic text-center mb-6">No hay reservas para esta fecha.</p>
                  ) : (
                    <>
                      {/* Indicadores de resumen para mesa específica */}
                      <div className="flex justify-between items-center mb-4 px-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">Próximas:</span>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                            {reservasMesa.length}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-700">Total personas:</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                            {reservasMesa.reduce((total, reserva) => total + (reserva.cantidad_personas || 0), 0)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-350px)] pr-1 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-orange-100">
                        {sortReservasByHorario(reservasMesa).map((reserva) => (
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
                    </>
                  )}                  {/* BOTONES */}
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
                      onClick={() => setShowWalkInModal(true)}
                      className="w-full py-3 bg-blue-500 text-white rounded-md font-semibold shadow hover:bg-blue-600 transition"
                    >
                      Sentar Walk-in
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
                
                {/* Indicadores de resumen */}
                <div className="flex justify-between items-center mb-4 px-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Próximas:</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                      {todasReservas.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Total personas:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                      {todasReservas.reduce((total, reserva) => total + (reserva.cantidad_personas || 0), 0)}
                    </span>
                  </div>
                </div>
                
                {todasReservas.length === 0 ? (
                  <p className="text-gray-600 italic text-center mb-6">No hay reservas para esta fecha.</p>
                ) : (
                  todasReservas.map((reserva) => (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
            key={reserva.id}
            id={`reserva-${reserva.id}`}
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
                      <div className="text-gray-700 text-sm font-medium">
                        👥 {reserva.cantidad_personas} personas
                      </div>
                      <div className="text-gray-600 text-sm">
                        🪑 {reserva.salon_nombre} - Mesa {reserva.numero_mesa || 'N/A'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        🕐 {reserva.horario_descripcion || 'Sin horario'}
                      </div>
                      {reserva.notas && (
                        <div className="text-gray-500 italic text-sm truncate">
                          📝 {reserva.notas}
                        </div>
                      )}
                      {/* Botón para asignar mesa si está confirmada y sin mesa */}
                      {reserva.status === 'confirmada' && (!reserva.mesa_id || reserva.mesa_id === null) && (mesaSeleccionada || defaultMesa) && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const mesaToAssign = mesaSeleccionada || defaultMesa;
                            if (!mesaToAssign) return;
                            try {
                              await axios.put(`${API_BASE_URL}/api/reservas/${reserva.id}`, {
                                mesa_id: mesaToAssign.id,
                                cliente_id: reserva.cliente_id,
                                horario_id: reserva.horario_id,
                                fecha_reserva: reserva.fecha_reserva.split('T')[0],
                                cantidad_personas: reserva.cantidad_personas,
                                notas: reserva.notas || null
                              });
                              await fetchTodasReservasPorFecha();
                              // Si la vista actual es por mesa recargar reservas de la mesa
                              await fetchReservasMesa();
                            } catch (err) {
                              console.error('Error asignando mesa', err);
                              alert('No se pudo asignar la mesa');
                            }
                          }}
                          className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold self-start"
                          title={(mesaSeleccionada || defaultMesa) ? `Asignar a mesa ${(mesaSeleccionada || defaultMesa)?.numero_mesa}` : 'Seleccione una mesa'}
                        >
                          Asignar a Mesa {(mesaSeleccionada || defaultMesa)?.numero_mesa}
                        </button>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </aside>

      {/* Main */}
      <main className={`flex-1 relative ${isMobile ? 'mt-0' : ''}`}>
        <div className="p-4">
          {!isMobile && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Salones y Mesas</h1>
              </div>
              {/* Header for mobile and desktop */}
              <div className={`flex flex-col ${isMobile ? 'fixed top-0 left-0 right-0 bg-white z-10 px-4 py-2 shadow-md' : 'mb-4'}`}>
                {/* Title and Actions Row */}
                <div className="flex items-center justify-between mb-2">
                  {!isMobile && <h1 className="text-2xl font-bold">Salones y Mesas</h1>}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: isMobile ? 1.02 : 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAgregarMesaModal(true)}
                      className={`${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-full bg-green-600 text-white hover:bg-green-700 transition shadow whitespace-nowrap`}
                    >
                      {isMobile ? '+Mesa' : 'Nueva Mesa'}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: isMobile ? 1.02 : 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsEditMode(!isEditMode)}
                      className={`flex items-center gap-1 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-full shadow whitespace-nowrap ${
                        isEditMode ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      } transition`}
                    >
                      <Move className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                      {isMobile ? 'Mover' : (isEditMode ? 'Modo mover activo' : 'Mover Mesas')}
                    </motion.button>
                  </div>
                </div>

                {/* Salon Tabs */}
                <div className={`${isMobile ? 'w-full overflow-x-auto' : 'border-b border-gray-300'}`}>
                  <nav className={`flex ${isMobile ? 'gap-2' : 'space-x-4'} ${isMobile ? 'pb-2' : ''}`}>
                    {salones.map((salon) => (
                      <button
                        key={salon.id}
                        onClick={() => setSelectedSalonId(salon.id)}
                        className={`${isMobile ? 'py-1.5 px-3 text-sm' : 'py-2 px-4'} 
                          whitespace-nowrap ${isMobile ? 'rounded-lg' : 'rounded-t-lg'} font-semibold
                          ${selectedSalonId === salon.id
                            ? 'bg-orange-500 text-white shadow'
                            : isMobile 
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'text-gray-600 hover:text-orange-600'
                          } transition`}
                        title={`Capacidad: ${salon.capacidad}${salon.es_condicion_especial ? ' (Condición especial)' : ''}`}
                      >
                        {salon.nombre}
                      </button>
                    ))}
                  </nav>
                </div>
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
            </>
          )}

          {/* Mobile Content */}
          {isMobile && (
            <div className="mb-4">
              {/* Title and Actions Row for Mobile */}
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-gray-800">
                  {mesaSeleccionada ? `Mesa ${mesaSeleccionada.numero_mesa}` : 'Salones y Mesas'}
                </h1>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAgregarMesaModal(true)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition shadow"
                  >
                    +Mesa
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg shadow ${
                      isEditMode ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-700'
                    } transition`}
                  >
                    <Move className="w-4 h-4" />
                    {isEditMode ? 'Moviendo' : 'Mover'}
                  </motion.button>
                </div>
              </div>

              {/* Salon Tabs Row for Mobile */}
              <div className="overflow-x-auto">
                <div className="flex gap-2">
                  {salones.map((salon) => (
                    <button
                      key={salon.id}
                      onClick={() => setSelectedSalonId(salon.id)}
                      className={`px-3 py-2 text-sm whitespace-nowrap rounded-lg font-medium flex-shrink-0 ${
                        selectedSalonId === salon.id
                          ? 'bg-orange-500 text-white shadow'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition`}
                    >
                      {salon.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div 
            ref={containerRef} 
            className="relative w-full bg-white rounded-lg shadow-lg p-4 overflow-auto"
            style={{ 
              height: isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 160px)',
              minHeight: isMobile ? '300px' : '400px',
              touchAction: 'none' // Prevents scrolling while dragging on mobile
            }}
          >
            {mesas.map((mesa) => {
              const bloqueosDeMesa = bloqueosMesa.filter((b) => b.mesa_id === mesa.id);
              const baseSize = isMobile ? 0.8 : 1; // Reduce size on mobile
              const getSize = (tamanio: string) => {
                const sizes = {
                  'pequeña': 50,
                  'mediana': 70,
                  'grande': 90
                };
                return sizes[tamanio as keyof typeof sizes] * baseSize;
              };

           

            

              return (
                <motion.div
                  key={mesa.id}
                  drag={isEditMode}
                  dragConstraints={containerRef}
                  dragMomentum={false} // Better control on mobile
                  whileDrag={{ scale: 1.1, zIndex: 100 }}
                  whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                  onDragEnd={(event, info) => handleDragEnd(mesa.id, info)}
                  onClick={() => {
                    console.log('🎯 [MESA SELECCIONADA] Mesa clickeada:', {
                      id: mesa.id,
                      numero_mesa: mesa.numero_mesa,
                      tipo_mesa: mesa.tipo_mesa,
                      tamanio: mesa.tamanio,
                      capacidad: mesa.capacidad,
                      salon_id: mesa.salon_id,
                      posicion: { x: mesa.posX, y: mesa.posY },
                      fecha_actual: fechaSeleccionada,
                      timestamp: new Date().toISOString()
                    });
                    
                    setMesaSeleccionada(mesa);
                    setReservaSeleccionada(null);
                    setBloqueoSeleccionado(null);
                    setActiveTab('mesa');
              
                  }}
                  className={`absolute flex flex-col items-center justify-center text-gray-900 font-semibold shadow-md cursor-pointer transition-colors ${
                    mesa.tipo_mesa === 'redonda'
                      ? 'rounded-full'
                      : mesa.tipo_mesa === 'cuadrada'
                      ? 'rounded-lg'
                      : 'rounded-md'
                  } ${isEditMode ? 'cursor-move' : ''}`}
                  style={{
                    width: getSize(mesa.tamanio),
                    height: getSize(mesa.tamanio),
                    backgroundColor:
                      mesaSeleccionada?.id === mesa.id
                        ? '#F97316'
                        : bloqueosDeMesa.length > 0
                        ? '#FCA5A5'
                        : '#F3E8D9',
                    border: '3px dashed #D97706',
                    top: 0,
                    left: 0,
                    WebkitTapHighlightColor: 'transparent', // Removes tap highlight on mobile
                    touchAction: 'none' // Prevents scrolling while dragging on mobile
                  }}
                  animate={{ 
                    x: mesa.posX || 0, 
                    y: mesa.posY || 0,
                    scale: mesaSeleccionada?.id === mesa.id ? 1.05 : 1
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 300, 
                    damping: 30,
                    scale: { duration: 0.2 }
                  }}
                >
                  <div className="text-sm">{mesa.numero_mesa}</div>
                  {bloqueosDeMesa.length > 0 && (
                    <div className="text-xs text-red-700 mt-1">Bloqueada</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Mobile Alert/Modal */}
      {isMobile && mesaSeleccionada && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-4 z-50 bg-[#FFF8E1] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{ maxHeight: 'calc(100vh - 32px)' }}
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setMesaSeleccionada(null);
            }}
          />
          {/* Modal Header */}
          <div className="px-4 py-3 bg-white border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#3C2022]">
              Mesa {mesaSeleccionada.numero_mesa}
            </h2>
            <button
              onClick={() => {
                setMesaSeleccionada(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {/* Tabs */}
            <div className="flex mb-4 bg-white rounded-lg overflow-hidden border border-orange-200">
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
            </div>
            
            <label htmlFor="fechaSeleccionada" className="block mb-2 font-semibold text-[#3C2022]">
              Seleccionar Fecha
            </label>
            <input
              type="date"
              id="fechaSeleccionada"
              value={fechaSeleccionada}
              onChange={(e) => {
                console.log('📅 [MOBILE DATE CHANGE] Fecha cambiada desde mobile:', {
                  fechaAnterior: fechaSeleccionada,
                  fechaNueva: e.target.value,
                  mesaSeleccionada: mesaSeleccionada ? {
                    id: mesaSeleccionada.id,
                    numero: mesaSeleccionada.numero_mesa
                  } : null,
                  activeTab: activeTab,
                  timestamp: new Date().toISOString()
                });
                setFechaSeleccionada(e.target.value);
                // Actualizar la URL con la nueva fecha
                updateURLWithDate(e.target.value);
                // Refrescar ambos tabs cuando cambia la fecha
                if (activeTab === 'todas') {
                  fetchTodasReservasPorFecha();
                } else if (activeTab === 'mesa' && mesaSeleccionada) {
                  fetchReservasMesa();
                }
              }}
              className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
            />

            {activeTab === 'mesa' && mesaSeleccionada ? (
              <>
                {/* Mesa Content */}
                {bloqueosMesa.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-300">
                    <h3 className="font-semibold text-red-600 mb-2">Bloqueos</h3>
                    <div className="space-y-2">
                      {bloqueosMesa.map((bloqueo) => (
                        <div
                          key={bloqueo.id}
                          className="p-2 bg-white rounded border border-red-200 text-sm"
                        >
                          <p>🕒 {bloqueo.hora_inicio} - {bloqueo.hora_fin}</p>
                          <p className="text-xs text-red-600">📅 {bloqueo.fecha}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reservas */}
                <div className="space-y-3">
                  {/* Indicadores de resumen para mesa específica (móvil) */}
                  {reservasMesa.length > 0 && (
                    <div className="flex justify-between items-center mb-3 px-2 py-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">Próximas:</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                          {reservasMesa.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">Total personas:</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                          {reservasMesa.reduce((total, reserva) => total + (reserva.cantidad_personas || 0), 0)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {reservasMesa.length === 0 ? (
                    <p className="text-gray-500 text-center">No hay reservas para esta fecha</p>
                  ) : (
                    sortReservasByHorario(reservasMesa).map((reserva) => (
                      <div
                        key={reserva.id}
                        id={`reserva-${reserva.id}`}
                        onClick={() => setReservaSeleccionada(reserva)}
                        className="p-3 bg-white rounded-lg border shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">
                            👤 {reserva.cliente_nombre} {reserva.cliente_apellido}
                          </span>
                          {reserva.status === 'sentado' && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Sentado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          👥 {reserva.cantidad_personas} personas
                        </p>
                        {reserva.horario_descripcion && (
                          <p className="text-sm text-gray-600">
                            🕐 {reserva.horario_descripcion}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowNewReservationModal(true)}
                    className="w-full py-2 bg-orange-500 text-white rounded-lg font-medium"
                  >
                    Nueva Reserva
                  </button>
                  <button
                    onClick={() => setShowBlockTableModal(true)}
                    className="w-full py-2 bg-red-500 text-white rounded-lg font-medium"
                  >
                    Bloquear Mesa
                  </button>
                  <button
                    onClick={() => setShowWalkInModal(true)}
                    className="w-full py-2 bg-blue-500 text-white rounded-lg font-medium"
                  >
                    Sentar Walk-in
                  </button>
                </div>
              </>
            ) : (
              // Todas las reservas content
              <div className="space-y-3">
                {/* Indicadores de resumen para todas las reservas (móvil) */}
                {todasReservas.length > 0 && (
                  <div className="flex justify-between items-center mb-3 px-2 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">Próximas:</span>
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-bold">
                        {todasReservas.length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">Total personas:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                        {todasReservas.reduce((total, reserva) => total + (reserva.cantidad_personas || 0), 0)}
                      </span>
                    </div>
                  </div>
                )}
                
                {todasReservas.length === 0 ? (
                  <p className="text-gray-500 text-center">No hay reservas para esta fecha</p>
                ) : (
                  todasReservas.map((reserva) => (
                    <div
                      key={reserva.id}
                      onClick={() => setReservaSeleccionada(reserva)}
                      className="p-3 bg-white rounded-lg border shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          👤 {reserva.cliente_nombre} {reserva.cliente_apellido}
                        </span>
                        {reserva.status === 'sentado' && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            Sentado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        👥 {reserva.cantidad_personas} personas
                      </p>
                      <p className="text-sm text-gray-600">
                        🪑 {reserva.salon_nombre} - Mesa {reserva.numero_mesa || 'N/A'}
                      </p>
                      {reserva.horario_descripcion && (
                        <p className="text-sm text-gray-600">
                          🕐 {reserva.horario_descripcion}
                        </p>
                      )}
                      {reserva.status === 'confirmada' && (!reserva.mesa_id || reserva.mesa_id === null) && (mesaSeleccionada || defaultMesa) && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const mesaToAssign = mesaSeleccionada || defaultMesa;
                            if (!mesaToAssign) return;
                            try {
                              await axios.put(`${API_BASE_URL}/api/reservas/${reserva.id}`, {
                                mesa_id: mesaToAssign.id,
                                cliente_id: reserva.cliente_id,
                                horario_id: reserva.horario_id,
                                fecha_reserva: reserva.fecha_reserva.split('T')[0],
                                cantidad_personas: reserva.cantidad_personas,
                                notas: reserva.notas || null
                              });
                              await fetchTodasReservasPorFecha();
                              if (activeTab === 'mesa') {
                                await fetchReservasMesa();
                              }
                            } catch (err) {
                              console.error('Error asignando mesa', err);
                              alert('No se pudo asignar la mesa');
                            }
                          }}
                          className="mt-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs font-semibold"
                        >
                          Asignar a Mesa {(mesaSeleccionada || defaultMesa)?.numero_mesa}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Modales */}
      {reservaSeleccionada && reservaSeleccionada.id && (
        <ReservationDetailsPanel
          reservaId={reservaSeleccionada.id}
          onClose={async () => {
            await reloadReservas();
            setReservaSeleccionada(null);
          }}
          onReservaFinalizada={async () => {
            await reloadReservas();
            setReservaSeleccionada(null);
          }}
        />
      )}

      {/* Modals */}
      {showNewReservationModal && mesaSeleccionada && (
        <NewReservationModal
          isOpen={showNewReservationModal}
          onClose={() => setShowNewReservationModal(false)}
          tableId={mesaSeleccionada?.id || 0}
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
          tableId={mesaSeleccionada?.id || 0}
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
          mesaId={mesaSeleccionada?.id || 0}
          mesaNumero={mesaSeleccionada?.numero_mesa || ''}
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

      {/* Reservation Details Panel */}
      {reservaSeleccionada?.id && (
        <ReservationDetailsPanel
          reservaId={reservaSeleccionada.id}
          onClose={async () => {
            await reloadReservas();
            setReservaSeleccionada(null);
          }}
          onReservaFinalizada={async () => {
            await reloadReservas();
            setReservaSeleccionada(null);
          }}
        />
      )}
      </div>
    </div>
  );
};

export default Timeline;
