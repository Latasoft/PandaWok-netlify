import React, { useEffect, useState } from "react";
import axios from "axios";

interface Cliente {
  nombre: string;
  apellido: string;
  correo_electronico: string;
}

interface Reserva {
  id: number;
  cliente: Cliente | null;
  fecha_reserva: string;
  estado: string;
  cantidad_personas: number;
  notas: string | null;
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEstadoId, setLoadingEstadoId] = useState<number | null>(null);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<Record<number, string>>({});

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const res = await api.get("reservas");
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
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const actualizarEstado = async (id: number) => {
    const nuevoEstado = estadoSeleccionado[id];
    if (!nuevoEstado) return;

    setLoadingEstadoId(id);
    try {
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Confirmar Reservas</h1>

      {loading && <p>Cargando reservas...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Cliente</th>
              <th className="border border-gray-300 p-2">Correo</th>
              <th className="border border-gray-300 p-2">Fecha</th>
              <th className="border border-gray-300 p-2">Estado</th>
              <th className="border border-gray-300 p-2">Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  No hay reservas disponibles.
                </td>
              </tr>
            ) : (
              reservas.map((reserva) => {
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
