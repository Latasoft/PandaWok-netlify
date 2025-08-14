import React, { useEffect, useState } from 'react';
import axios from 'axios';

type Reserva = {
  id: number;
  cliente_id: number | null;
  mesa_id: number | null;
  horario_id: number | null;
  fecha_reserva: string;
  cantidad_personas: number;
  notas?: string;
  estado?: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  creado_por?: number | null;
  status?: string | null;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  correo_electronico?: string;
};

const estados = ['Todos', 'Pendiente', 'Confirmada', 'Cancelado', 'Finalizado'];

const ListaReservas: React.FC = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [estado, setEstado] = useState('Todos');
  const [cliente, setCliente] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (estado !== 'Todos') params.append('estado', estado);
      if (cliente.trim()) params.append('cliente', cliente.trim());

      const response = await axios.get<{ success: boolean; reservas: Reserva[] }>(
        `${API_BASE_URL}/api/reservas?${params.toString()}`
      );

      if (response.data.success) {
        setReservas(response.data.reservas);
        setError('');
      } else {
        setError('Error al obtener reservas');
      }
    } catch {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReservas();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 bg-gray-50 rounded-lg shadow-md min-h-screen">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-[#4B3621]">Lista de Reservas</h1>

      {/* Filtros */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-4 justify-center items-center mb-10 flex-wrap"
      >
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-[#A17C5B] bg-white text-gray-700 px-4 py-2 rounded-md w-full max-w-xs placeholder-[#A17C5B]"
          placeholder="Desde"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-[#A17C5B] bg-white text-gray-700 px-4 py-2 rounded-md w-full max-w-xs placeholder-[#A17C5B]"
          placeholder="Hasta"
        />
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="border border-[#A17C5B] bg-white text-gray-700 px-4 py-2 rounded-md w-full max-w-xs"
        >
          {estados.map((e) => (
            <option key={e} value={e} className="bg-white text-gray-700">
              {e}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
          className="border border-[#A17C5B] bg-white text-gray-700 px-4 py-2 rounded-md w-full max-w-xs placeholder-[#A17C5B]"
          placeholder="Buscar cliente (nombre, apellido, correo)"
        />
        <button
          type="submit"
          className="bg-[#4B3621] hover:bg-[#3A2A17] text-white px-6 py-2 rounded-md shadow font-semibold transition-colors"
        >
          Filtrar
        </button>
      </form>

      {/* Mensajes de estado */}
      {loading && <p className="text-center text-gray-600">Cargando reservas...</p>}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}
      {!loading && reservas.length === 0 && (
        <p className="text-center text-gray-500">No hay reservas que coincidan con los filtros.</p>
      )}

      {/* Tabla */}
      {reservas.length > 0 && (
        <div className="overflow-x-auto shadow border border-[#A17C5B] rounded-lg">
          <table className="min-w-full divide-y divide-[#D4C4A8]">
            <thead className="bg-[#A17C5B]">
              <tr>
                {['ID', 'Fecha', 'Personas', 'Cliente', 'Teléfono', 'Correo', 'Notas', 'Estado'].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-6 py-3 text-left text-xs font-semibold text-white uppercase select-none"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#D4C4A8]">
              {reservas.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-[#F5F1E9]' : ''}>
                  <td className="px-6 py-4 text-sm text-gray-800">{r.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {new Date(r.fecha_reserva).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{r.cantidad_personas}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">
                    {`${r.nombre ?? ''} ${r.apellido ?? ''}`.trim() || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800">{r.telefono ?? '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 break-all">
                    {r.correo_electronico ?? '-'}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-gray-800 truncate max-w-xs"
                    title={r.notas ?? ''}
                  >
                    {r.notas ?? '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#4B3621]">
                    {r.estado ?? '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ListaReservas;
