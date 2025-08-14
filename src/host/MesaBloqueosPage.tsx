import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BlockTableModal from '../components/BlockTableModal'; // Ajusta ruta si es necesario

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MesaBloqueosPage: React.FC = () => {
  const [bloqueos, setBloqueos] = useState<any[]>([]);
  const [salonId, setSalonId] = useState<number>(1);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<number | null>(null);

  // Genera horarios en intervalos de 30 min desde 00:00 a 23:30
  const generateTimeOptions = (): string[] => {
    const times: string[] = [];
    for (let hour = 0; hour < 24; hour++) {
      ['00', '30'].forEach((m) => {
        times.push(`${String(hour).padStart(2, '0')}:${m}`);
      });
    }
    return times;
  };

  const cargarBloqueos = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/mesa-bloqueos/salon/${salonId}`, {
        params: { fecha },
      });
      setBloqueos(res.data.bloqueos);
    } catch (err) {
      console.error(err);
      alert('Error cargando bloqueos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarBloqueos();
  }, [salonId, fecha]);

  const desbloquearMesa = async (id: number) => {
    if (!window.confirm('¿Seguro que quieres desbloquear esta mesa?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/mesa-bloqueos/${id}`);
      cargarBloqueos();
    } catch (err) {
      console.error(err);
      alert('Error desbloqueando la mesa');
    }
  };

  const handleBlock = async (
    tableId: number,
    startTime: string,
    endTime: string,
    blockDate: string
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/api/mesa-bloqueos`, {
        mesa_id: tableId,
        fecha: blockDate,
        hora_inicio: startTime,
        hora_fin: endTime,
      });
      cargarBloqueos();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.mensaje || 'Error creando bloqueo');
    }
  };

  // Para abrir modal y pedir mesa con prompt simple
  const abrirModal = () => {
    const mesaIdStr = prompt('Ingrese el ID de la mesa a bloquear:');
    if (!mesaIdStr) return;
    const mesaIdNum = Number(mesaIdStr);
    if (isNaN(mesaIdNum)) {
      alert('ID de mesa inválido');
      return;
    }
    setMesaSeleccionada(mesaIdNum);
    setModalOpen(true);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Bloqueos de Mesas</h1>

      <div className="mb-4 flex gap-4 items-center">
        <label>
          Fecha:{' '}
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </label>

        <button
          onClick={abrirModal}
          className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Bloquear nueva mesa
        </button>
      </div>

      {loading ? (
        <p>Cargando bloqueos...</p>
      ) : bloqueos.length === 0 ? (
        <p>No hay mesas bloqueadas para la fecha seleccionada.</p>
      ) : (
        <table className="w-full border border-gray-300 rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID Bloqueo</th>
              <th className="border px-2 py-1">Mesa ID</th>
              <th className="border px-2 py-1">Fecha</th>
              <th className="border px-2 py-1">Hora Inicio</th>
              <th className="border px-2 py-1">Hora Fin</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bloqueos.map((bloqueo) => (
              <tr key={bloqueo.id}>
                <td className="border px-2 py-1 text-center">{bloqueo.id}</td>
                <td className="border px-2 py-1 text-center">{bloqueo.mesa_id}</td>
                <td className="border px-2 py-1 text-center">{bloqueo.fecha}</td>
                <td className="border px-2 py-1 text-center">{bloqueo.hora_inicio}</td>
                <td className="border px-2 py-1 text-center">{bloqueo.hora_fin}</td>
                <td className="border px-2 py-1 text-center">
                  <button
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    onClick={() => desbloquearMesa(bloqueo.id)}
                  >
                    Desbloquear
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <BlockTableModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onBlock={handleBlock}
        tableId={mesaSeleccionada}
        currentSalonName={`Salón ${salonId}`}
        generateTimeOptions={generateTimeOptions}
      />
    </div>
  );
};

export default MesaBloqueosPage;
