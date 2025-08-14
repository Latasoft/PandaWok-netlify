import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiTrash2 } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type BloqueoMesa = {
  id: number;
  mesa_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  created_at: string;
  updated_at: string;
};

export default function BloqueosPage() {
  const [bloqueos, setBloqueos] = useState<BloqueoMesa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const fetchBloqueos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/mesas/bloqueos`);
      if (Array.isArray(res.data)) {
        setBloqueos(res.data);
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar bloqueos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarBloqueo = async (id: number) => {
    const confirmar = window.confirm('¿Seguro que quieres eliminar este bloqueo?');
    if (!confirmar) return;

    try {
      setEliminandoId(id); // Marca el bloqueo como eliminando (para animar)
      await axios.delete(`${API_BASE_URL}/api/mesas/bloqueos/${id}`);

      // Esperamos 400ms para que la animación termine
      setTimeout(() => {
        setBloqueos((prev) => prev.filter((b) => b.id !== id));
        setEliminandoId(null);
        setMensaje('Bloqueo eliminado correctamente');

        // Oculta el mensaje después de 3 segundos
        setTimeout(() => setMensaje(null), 3000);
      }, 400);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el bloqueo');
      setEliminandoId(null);
    }
  };

  useEffect(() => {
    fetchBloqueos();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-xl shadow-xl border border-gray-200 relative">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900 border-b border-gray-300 pb-4">
        Bloqueos de Mesas
      </h1>

      {mensaje && (
        <div className="absolute top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow-md font-semibold transition-opacity duration-500">
          {mensaje}
        </div>
      )}

      {loading && (
        <p className="text-center text-gray-500 italic text-lg">Cargando bloqueos...</p>
      )}

      {error && (
        <p className="text-center text-red-600 font-semibold text-lg">{error}</p>
      )}

      {!loading && !error && (
        <>
          {bloqueos.length === 0 ? (
            <p className="text-center text-gray-400 italic text-lg">
              No hay bloqueos registrados
            </p>
          ) : (
            <ul className="space-y-6">
              {bloqueos.map((b) => {
                const isEliminando = eliminandoId === b.id;
                return (
                  <li
                    key={b.id}
                    className={`flex justify-between items-center bg-gradient-to-r from-gray-50 to-white border border-gray-300 rounded-lg shadow-md p-5 transition-shadow duration-300
                      ${isEliminando ? 'opacity-0 max-h-0 overflow-hidden p-0 m-0 border-0 shadow-none' : 'opacity-100 max-h-96'}
                    `}
                    style={{ transitionProperty: 'opacity, max-height, padding, margin, border, box-shadow', transitionDuration: '400ms' }}
                  >
                    <div>
                      <p className="text-gray-900 font-bold text-lg">
                        Bloqueo #{b.id} — Mesa {b.mesa_id}
                      </p>
                      <p className="text-gray-700 mt-1">
                        <span className="font-semibold">Desde:</span>{' '}
                        <span className="text-indigo-600">{b.hora_inicio}</span>{' '}
                        <span className="font-semibold ml-4">Hasta:</span>{' '}
                        <span className="text-indigo-600">{b.hora_fin}</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1 italic">
                        Fecha: {b.fecha}
                      </p>
                    </div>
                    <button
                      onClick={() => eliminarBloqueo(b.id)}
                      aria-label={`Eliminar bloqueo ${b.id}`}
                      className="text-red-600 hover:text-red-800 transition duration-300 flex items-center gap-1 font-semibold"
                      title="Eliminar bloqueo"
                      disabled={isEliminando}
                    >
                      <FiTrash2 size={20} />
                      Eliminar
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
