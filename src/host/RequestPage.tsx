import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewRequestModal from '../components/NewRequestModal';
import emailjs from '@emailjs/browser';

// Define una interfaz para los datos de la solicitud, similar a lo que enviará el modal
interface RequestData {
  telefono: string;
  email: string;
  clientTags: string[];
  reservationTags: string[];
  membershipNumber: string;
  reservationNote: string;
  file: string | null;
  fecha: string;
  hora: string;
  personas: number | '';
  tipoReserva: string;
  buscarComensal: string;
  nombre: string;
  apellido: string;
}

// Interfaces para las reservas del backend
interface Cliente {
  nombre: string;
  apellido: string;
  correo_electronico: string;
  telefono?: string;
}

interface Reserva {
  id: number;
  cliente: Cliente | null;
  fecha_reserva: string;
  estado: string;
  cantidad_personas: number;
  notas: string | null;
  horario_id: number | null; // <-- Agregar
}

interface PaginationMeta {
page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL + "/api"
      : "http://localhost:5000/api",
});

const estadosPosibles = ["pendiente", "confirmada", "cancelada"];

const RequestPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, ] = useState('Reserva más cercana');
  const [showFilters, setShowFilters] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  // Removido activeTab ya que solo mostraremos reservas

  // Estados para reservas
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEstadoId, setLoadingEstadoId] = useState<number | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Record<number, string>>({});
  // Estados de filtros
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<string>('');
  const [filtroFechaFin, setFiltroFechaFin] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  // usamos searchTerm como filtro de cliente (nombre/apellido/correo)
  const [appliedFiltersCount, setAppliedFiltersCount] = useState<number>(0);
  // Paginación
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateRequestClick = () => {
    setIsNewRequestModalOpen(true);
  };

  const handleNewRequestCreated = (requestData: RequestData) => {
    console.log('Nueva solicitud creada:', requestData);
    // Cerrar modal
    setIsNewRequestModalOpen(false);
    // Refrescar reservas (manteniendo filtros actuales si los hay)
    fetchReservas({ applyFilters: true });
  };

  // Funciones para manejar reservas
  const fetchReservas = React.useCallback(async (options?: { applyFilters?: boolean; resetPage?: boolean }) => {
    const resetting = options?.resetPage;
    if (resetting && page !== 1) setPage(1);
    const currentPage = resetting ? 1 : page;
    setLoading(true);
    try {
      // Construir query params si se aplican filtros
      let url = 'reservas';
      const params = new URLSearchParams();
      const applying = options?.applyFilters;
      if (applying) {
        if (filtroFechaInicio && filtroFechaFin) {
          params.append('startDate', filtroFechaInicio);
          params.append('endDate', filtroFechaFin);
        }
        if (filtroEstado) {
          params.append('estado', filtroEstado);
        }
        if (searchTerm.trim()) {
          params.append('cliente', searchTerm.trim());
        }
      } else {
        // si no se aplica explícitamente pero hay filtros ya establecidos (por ejemplo refresco tras cambio de estado)
        if (filtroFechaInicio && filtroFechaFin) {
          params.append('startDate', filtroFechaInicio);
          params.append('endDate', filtroFechaFin);
        }
        if (filtroEstado) {
          params.append('estado', filtroEstado);
        }
        if (searchTerm.trim()) {
          params.append('cliente', searchTerm.trim());
        }
      }
      // siempre añadir paginación
  params.append('page', String(currentPage));
      params.append('limit', String(limit));
      url += `?${params.toString()}`;
      const res = await api.get(url);
      // ordenar por id ascendente antes de setear el estado
      const ordenadas: Reserva[] = Array.isArray(res.data.reservas)
        ? [...res.data.reservas].sort((a: Reserva, b: Reserva) => b.id - a.id)
        : [];
      setReservas(ordenadas);
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
      const estadosInit: Record<number, string> = {};
      res.data.reservas.forEach((r: Reserva) => {
        estadosInit[r.id] = r.estado.toLowerCase();
      });
      setEstadoSeleccionado(estadosInit);
      setError(null);
      // actualizar número de filtros aplicados
      const count = [
        filtroFechaInicio && filtroFechaFin ? 1 : 0,
        filtroEstado ? 1 : 0,
        searchTerm.trim() ? 1 : 0,
      ].reduce((a, b) => a + b, 0);
      setAppliedFiltersCount(count);
    } catch {
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }, [page, limit, filtroFechaInicio, filtroFechaFin, filtroEstado, searchTerm]);

  useEffect(() => {
    // inicializar EmailJS una sola vez en el frontend
    try {
      emailjs.init('BgQlos8cUH1tIBIo5');
    } catch (err) {
      console.warn('EmailJS init warning', err);
    }
  }, []); // <-- vacío: solo al montar

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  const actualizarEstado = async (id: number) => {
    const nuevoEstado = estadoSeleccionado[id];
    if (!nuevoEstado) return;

    setLoadingEstadoId(id);
    try {
      // Actualiza estado en backend (solo eso)
      await api.post(`reservas/${id}/estado`, { estado: nuevoEstado });
      await fetchReservas();
    } catch {
      alert("Error al actualizar estado");
    } finally {
      setLoadingEstadoId(null);
    }
  };

  const EstadoBadge: React.FC<{ estado: string }> = ({ estado }) => {
    const lower = estado.toLowerCase();
    const baseStyle = "inline-block px-3 py-1 rounded text-white text-sm font-semibold";
    if (lower === "confirmada") return <span className={`${baseStyle} bg-green-600`}>Confirmada</span>;
    if (lower === "pendiente") return <span className={`${baseStyle} bg-yellow-500`}>Pendiente</span>;
    if (lower === "cancelada") return <span className={`${baseStyle} bg-red-600`}>Cancelada</span>;
    return <span className={`${baseStyle} bg-gray-500`}>{estado}</span>;
  };

  const aplicarFiltros = () => {
    fetchReservas({ applyFilters: true, resetPage: true });
    setShowFilters(false);
  };

  const limpiarFiltros = () => {
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEstado('');
    setSearchTerm('');
    fetchReservas({ applyFilters: true, resetPage: true });
  };

const getHorarioRange = (horarioId: number | null): string => {
  if (!horarioId) return 'Sin horario';
  const startHour = 12 + Math.ceil((horarioId - 1) / 2); // <-- Cambiar Math.floor por Math.ceil
  const startMinute = horarioId % 2 === 1 ? 30 : 0;
  const endHour = startMinute === 30 ? startHour + 1 : startHour;
  const endMinute = startMinute === 30 ? 0 : 30;
  return `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')} - ${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
};
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#211B17' }}>
      <h1 className="text-white text-2xl md:text-3xl font-semibold mb-6">Confirmar Reservas</h1>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#3C2022] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Botones de Ordenar y Filtros */}
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3C2022] text-white hover:bg-opacity-80 transition-colors text-sm"
            onClick={() => console.log('Ordenar por')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m-12 4h12m-12 4h12M4 7v10l3-3m0 0l-3-3" />
            </svg>
            <span>Ordenar por: {sortOrder}</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3C2022] text-white hover:bg-opacity-80 transition-colors text-sm relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtros {appliedFiltersCount > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{appliedFiltersCount}</span>
            )}</span>
          </button>
        </div>

        {/* Botón "+ Solicitud" */}
        <button
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors w-full md:w-auto"
          onClick={handleCreateRequestClick}
        >
          + Solicitud
        </button>
      </div>

      {/* Contenedor de reservas */}
      <p className="text-gray-400 text-sm mb-4">
        Mostrando {reservas.length} reservas
        {pagination && (
          <span className="ml-2 text-xs text-gray-500">Página {pagination.page} de {pagination.totalPages} (Total {pagination.total})</span>
        )}
      </p>

      {loading && <p className="text-gray-400">Cargando reservas...</p>}
      {error && <p className="text-red-400">{error}</p>}

            {!loading && !error && (
              <>
                <div className="bg-[#3C2022] rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr>
                          <th className="border border-gray-300 p-2 text-white">ID</th>
                          <th className="border border-gray-300 p-2 text-white">Cliente</th>
                          <th className="border border-gray-300 p-2 text-white">Correo</th>
                          <th className="border border-gray-300 p-2 text-white">Fecha</th>
                          <th className="border border-gray-300 p-2 text-white">Horario</th>
                          <th className="border border-gray-300 p-2 text-white">Personas</th>
                          <th className="border border-gray-300 p-2 text-white">Estado</th>
                          <th className="border border-gray-300 p-2 text-white">Cambiar Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservas.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-4 text-white">
                              No hay reservas disponibles.
                            </td>
                          </tr>
                        ) : (
                          reservas.map((reserva) => {
                            const estadoActual = reserva.estado.toLowerCase();
                            const estadoNuevo = estadoSeleccionado[reserva.id] || estadoActual;
                            const isChanged = estadoNuevo !== estadoActual;
                            return (
                              <tr key={reserva.id} className="hover:bg-[#4A3A35] transition-colors">
                                <td className="border border-gray-300 p-2 text-center text-white">{reserva.id}</td>
                                <td className="border border-gray-300 p-2 text-white">
                                  {reserva.cliente
                                    ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}`
                                    : "Walk-in / Sin cliente"}
                                </td>
                                <td className="border border-gray-300 p-2 text-white">
                                  {reserva.cliente ? reserva.cliente.correo_electronico : "-"}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-white">
                                  {new Date(reserva.fecha_reserva).toLocaleDateString()}
                                </td>
                                <td className="border border-gray-300 p-2 text-center text-white">
                                  {getHorarioRange(reserva.horario_id)} {/* <-- Cambiar para usar la función */}

                                </td>
                                <td className="border border-gray-300 p-2 text-center text-white">
                                  {reserva.cantidad_personas}
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <EstadoBadge estado={estadoActual} />
                                </td>
                                <td className="border border-gray-300 p-2 text-center flex items-center justify-center space-x-2">
                                  <select
                                    aria-label={`Seleccionar estado para reserva ${reserva.id}`}
                                    value={estadoNuevo}
                                    onChange={(e) =>
                                      setEstadoSeleccionado({
                                        ...estadoSeleccionado,
                                        [reserva.id]: e.target.value,
                                      })
                                    }
                                    className="border border-gray-600 rounded px-2 py-1 bg-[#2A1F1B] text-white"
                                    disabled={loadingEstadoId === reserva.id}
                                  >
                                    {estadosPosibles.map((e) => (
                                      <option key={e} value={e}>
                                        {e.charAt(0).toUpperCase() + e.slice(1)}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    disabled={!isChanged || loadingEstadoId === reserva.id}
                                    onClick={() => actualizarEstado(reserva.id)}
                                    className={`px-3 py-1 rounded text-white transition ${
                                      loadingEstadoId === reserva.id
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : isChanged
                                        ? "bg-blue-600 hover:bg-blue-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                    title={
                                      isChanged
                                        ? "Guardar nuevo estado"
                                        : "Seleccione un estado diferente para habilitar"
                                    }
                                  >
                                    {loadingEstadoId === reserva.id ? "Guardando..." : "Guardar"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-t border-gray-700">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        disabled={!pagination.hasPrevPage || loading}
                        onClick={() => pagination.hasPrevPage && setPage(p => Math.max(p - 1, 1))}
                        className={`px-3 py-1 rounded bg-[#2A1F1B] text-white text-sm ${!pagination.hasPrevPage || loading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#3C2022]'}`}
                      >Anterior</button>
                      <span className="text-gray-300 text-sm">Página {pagination.page} / {pagination.totalPages}</span>
                      <button
                        disabled={!pagination.hasNextPage || loading}
                        onClick={() => pagination.hasNextPage && setPage(p => p + 1)}
                        className={`px-3 py-1 rounded bg-[#2A1F1B] text-white text-sm ${!pagination.hasNextPage || loading ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#3C2022]'}`}
                      >Siguiente</button>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <label htmlFor="limit" className="text-xs uppercase tracking-wide">Por página</label>
                      <select
                        id="limit"
                        value={limit}
                        onChange={(e) => { setLimit(parseInt(e.target.value, 10)); setPage(1); }}
                        className="bg-[#2A1F1B] border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      >
                        {[10,20,30,50,100].map(sz => <option key={sz} value={sz}>{sz}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}

      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#3C2022] p-6 rounded-lg text-white w-full max-w-lg">
            <h3 className="text-xl mb-4 font-semibold">Filtros de Reservas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rango de Fechas</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                    className="flex-1 bg-[#2A1F1B] border border-gray-600 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <span className="text-gray-300">a</span>
                  <input
                    type="date"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                    className="flex-1 bg-[#2A1F1B] border border-gray-600 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>
                {filtroFechaInicio && filtroFechaFin && filtroFechaInicio > filtroFechaFin && (
                  <p className="text-xs text-red-400 mt-1">La fecha inicio no puede ser mayor que la fecha fin.</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full bg-[#2A1F1B] border border-gray-600 rounded px-2 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="">Todos</option>
                  {estadosPosibles.map(est => (
                    <option key={est} value={est}>{est.charAt(0).toUpperCase() + est.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cliente (nombre / apellido / correo)</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej: juan, perez, correo@..."
                  className="w-full bg-[#2A1F1B] border border-gray-600 rounded px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-end">
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-sm font-medium"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 rounded bg-gray-500 hover:bg-gray-400 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                disabled={(filtroFechaInicio && filtroFechaFin && filtroFechaInicio > filtroFechaFin) || loading}
                onClick={aplicarFiltros}
                className="px-5 py-2 rounded bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
              >
                {loading ? 'Aplicando...' : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para nueva solicitud */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onCreateRequest={handleNewRequestCreated}
      />
    </div>
  );
};

export default RequestPage;