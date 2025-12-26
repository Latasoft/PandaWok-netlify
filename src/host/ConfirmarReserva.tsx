import React, { useEffect, useState } from "react";
import axios from "axios";
import { EMAILJS_CONFIG, sendEmailWithRetry } from "../utils/emailConfig";

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
  horario_id?: number | null;
}

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL + "/api"
      : "http://localhost:5000/api",
});

const estadosPosibles = ["pendiente", "confirmada", "cancelada"];

const ConfirmarReserva: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEstadoId, setLoadingEstadoId] = useState<number | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Record<number, string>>({});
  
  // Estados para el buscador
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');

  const fetchReservas = React.useCallback(async (useFilters = false) => {
    setLoading(true);
    try {
      let endpoint = "reservas";
      const params = new URLSearchParams();
      
      // Si se usan filtros, usar la nueva ruta de búsqueda
      if (useFilters && (searchTerm.trim() || filtroEstado !== 'todos' || filtroFecha)) {
        endpoint = "reservas/buscar/confirmar";
        
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
        if (filtroFecha) params.append('fecha', filtroFecha);
      }
      
      const finalUrl = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
      const res = await api.get(finalUrl);
      
      setReservas(res.data.reservas);
      const estadosInit: Record<number, string> = {};
      res.data.reservas.forEach((r: Reserva) => {
        estadosInit[r.id] = r.estado.toLowerCase();
      });
      setEstadoSeleccionado(estadosInit);
      setError(null);
    } catch {
      setError("Error al cargar las reservas");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filtroEstado, filtroFecha]);

  // Función para filtrar reservas - simplificada ya que el backend hace el filtrado principal
  const filtrarReservas = React.useCallback(() => {
    // Solo aplicar filtros locales básicos si es necesario
    // En este caso, como el backend ya filtra, simplemente copiamos las reservas
    setFilteredReservas([...reservas]);
  }, [reservas]);

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  useEffect(() => {
    filtrarReservas();
  }, [filtrarReservas]);

  // Función para aplicar filtros usando el backend
  const aplicarFiltros = () => {
    fetchReservas(true);
  };

  const actualizarEstado = async (id: number) => {
    const nuevoEstado = estadoSeleccionado[id];
    if (!nuevoEstado) {
      console.warn('⚠️ No hay estado seleccionado para la reserva', id);
      return;
    }

    const reserva = reservas.find(r => r.id === id);
    if (!reserva) {
      console.warn('⚠️ Reserva no encontrada:', id);
      return;
    }

    console.log('🔄 Actualizando reserva:', { id, nuevoEstado, reserva });

    setLoadingEstadoId(id);
    try {
      // 1. Actualizar estado en el backend
      console.log('📤 Enviando actualización al backend...');
      await api.post(`reservas/${id}/estado`, { estado: nuevoEstado });
      console.log('✅ Backend actualizado correctamente');
      
      // 2. Si el estado es "confirmada" Y el cliente tiene correo, enviar email de confirmación
      if (nuevoEstado === 'confirmada') {
        console.log('📧 Verificando envío de correo de confirmación...');
        
        if (!reserva.cliente?.correo_electronico) {
          console.warn('⚠️ Cliente no tiene correo electrónico:', reserva.cliente);
          alert('Reserva confirmada, pero el cliente no tiene correo electrónico registrado.');
        } else {
          try {
            console.log('🔧 Preparando datos del correo...');
            
            // Formatear fecha
            const fechaReserva = new Date(reserva.fecha_reserva);
            const fechaFormateada = fechaReserva.toLocaleDateString('es-CL', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            });

            // Mapeo básico de horarios (ajusta según tu sistema)
            const horarios: Record<number, string> = {
              1: '12:30 pm', 2: '1:00 pm', 3: '1:30 pm',
              4: '2:00 pm', 5: '2:30 pm', 6: '3:00 pm',
              7: '3:30 pm', 8: '4:00 pm', 9: '4:30 pm'
            };
            const horario = reserva.horario_id ? horarios[reserva.horario_id] || 'Por confirmar' : 'Por confirmar';

            const templateParams = {
              to_email: reserva.cliente.correo_electronico,
              customer_name: `${reserva.cliente.nombre} ${reserva.cliente.apellido}`,
              reservation_id: reserva.id,
              reservation_date: fechaFormateada,
              reservation_time: horario,
              party_size: reserva.cantidad_personas,
              phone: reserva.cliente.telefono || 'No proporcionado',
              comments: reserva.notas || 'Sin comentarios adicionales',
              from_name: 'Panda Wok Valparaíso',
              reply_to: 'reservas@pandawok.cl'
            };

            console.log('📧 EMAILJS CONFIG:', {
              templateId: EMAILJS_CONFIG.templateConfirmacionAdmin,
              serviceId: EMAILJS_CONFIG.serviceId,
              publicKey: EMAILJS_CONFIG.publicKey ? '✓ Configurado' : '✗ NO configurado'
            });
            
            console.log('📧 Parámetros del correo:', templateParams);

            await sendEmailWithRetry(
              EMAILJS_CONFIG.templateConfirmacionAdmin,
              templateParams
            );

            console.log('✅ Correo de confirmación enviado exitosamente a:', reserva.cliente.correo_electronico);
            alert(`Reserva confirmada y correo enviado a ${reserva.cliente.correo_electronico}`);
          } catch (emailError) {
            console.error('❌ Error enviando correo de confirmación:', emailError);
            console.error('❌ Stack trace:', (emailError as Error).stack);
            alert('Reserva actualizada, pero hubo un problema al enviar el correo de confirmación al cliente. Revisa la consola para más detalles.');
          }
        }
      }

      // 3. Recargar lista de reservas
      console.log('🔄 Recargando lista de reservas...');
      await fetchReservas();
      console.log('✅ Lista de reservas actualizada');
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error);
      console.error('❌ Stack trace:', (error as Error).stack);
      alert("Error al actualizar estado. Revisa la consola para más detalles.");
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmar Reservas</h1>

      {/* Buscador y filtros */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda por texto */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar reserva
            </label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por nombre, correo o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="filtroEstado" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              id="filtroEstado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Filtro por fecha */}
          <div>
            <label htmlFor="filtroFecha" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              id="filtroFecha"
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Buscar
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              setFiltroEstado('todos');
              setFiltroFecha('');
              fetchReservas(); // Recargar todas las reservas sin filtros
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            Limpiar filtros
          </button>
        </div>

        {/* Contador de resultados */}
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {filteredReservas.length} de {reservas.length} reservas
        </div>
      </div>

      {loading && <p>Cargando reservas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Cliente</th>
              <th className="border border-gray-300 p-2">Correo</th>
              <th className="border border-gray-300 p-2">Teléfono</th>
              <th className="border border-gray-300 p-2">Personas</th>
              <th className="border border-gray-300 p-2">Fecha</th>
              <th className="border border-gray-300 p-2">Estado</th>
              <th className="border border-gray-300 p-2">Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservas.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">
                  {searchTerm || filtroEstado !== 'todos' || filtroFecha
                    ? "No hay reservas que coincidan con los filtros."
                    : "No hay reservas disponibles."
                  }
                </td>
              </tr>
            ) : (
              filteredReservas.map((reserva) => {
                const estadoActual = reserva.estado.toLowerCase();
                const estadoNuevo = estadoSeleccionado[reserva.id] || estadoActual;
                const isChanged = estadoNuevo !== estadoActual;
                return (
                  <tr key={reserva.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 p-2 text-center">{reserva.id}</td>
                    <td className="border border-gray-300 p-2">
                      {reserva.cliente
                        ? `${reserva.cliente.nombre} ${reserva.cliente.apellido}`
                        : "Walk-in / Sin cliente"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {reserva.cliente ? reserva.cliente.correo_electronico : "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {reserva.cliente?.telefono || "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {reserva.cantidad_personas}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {new Date(reserva.fecha_reserva).toLocaleDateString()}
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
                        className="border border-gray-300 rounded px-2 py-1"
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
      )}
    </div>
  );
};

export default ConfirmarReserva;
