import React, { useState } from 'react';
import axios from 'axios';

interface WalkInModalProps {
  mesaId: number;
  mesaNumero: string | number;
  fechaSeleccionada: string;
  onClose: () => void;
  onReservaCreada: (reserva: any) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const WalkInModal: React.FC<WalkInModalProps> = ({
  mesaId,
  mesaNumero,
  fechaSeleccionada,
  onClose,
  onReservaCreada,
}) => {
  const [cantidad, setCantidad] = useState(1);
  const [notas, setNotas] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cantidades = Array.from({ length: 25 }, (_, i) => i + 1);

  const handleSubmit = async () => {
    setError(null);
    if (cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0.');
      return;
    }
    if (!mesaId) {
      setError('Mesa inválida.');
      return;
    }
    if (!fechaSeleccionada) {
      setError('Fecha no seleccionada.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/reservas/walk-in`, {
        mesa_id: mesaId,
        fecha_reserva: fechaSeleccionada,
        cantidad_personas: cantidad,
        notas: notas.trim() || null,
      });

      onReservaCreada(res.data.reserva);
      onClose();
    } catch (err: any) {
      console.error('Error creando walk-in:', err);
      setError(
        err.response?.data?.message ||
          'Ocurrió un error al crear la reserva walk-in.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkin-modal-title"
    >
      <div className="bg-[#FDF6E3] rounded-lg shadow-lg w-80 p-6 relative text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
          aria-label="Cerrar modal"
          type="button"
        >
          ×
        </button>

        <h2
          id="walkin-modal-title"
          className="text-xl font-semibold mb-4 text-center"
        >
          Sentar Walk-in
        </h2>

        <p className="mb-2 font-semibold">Mesa: {mesaNumero}</p>

        <label htmlFor="cantidad-comensales" className="block mb-1 font-semibold">
          Cantidad de comensales
        </label>
        <div
          id="cantidad-comensales"
          className="max-h-48 overflow-y-auto mb-4 border rounded bg-white"
          role="list"
        >
          {cantidades.map((num) => (
            <button
              key={num}
              onClick={() => setCantidad(num)}
              type="button"
              className={`w-full py-2 text-center text-gray-900 font-bold border-b last:border-none focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                cantidad === num ? 'bg-orange-500 text-white' : 'hover:bg-orange-100'
              }`}
              aria-pressed={cantidad === num}
            >
              {num}
            </button>
          ))}
        </div>

        <label htmlFor="notas" className="block mb-1 font-semibold">
          Notas (opcional)
        </label>
        <textarea
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full h-20 rounded border border-gray-300 p-2 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
          placeholder="Agregar notas..."
        />

        {error && (
          <p className="mb-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          disabled={loading || cantidad <= 0}
          onClick={handleSubmit}
          type="button"
          className={`w-full py-3 rounded font-semibold transition-colors duration-200 ${
            cantidad > 0
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-400 text-gray-700 cursor-not-allowed'
          } flex justify-center items-center`}
        >
          {loading && (
            <svg
              className="animate-spin mr-2 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          )}
          {loading ? 'Creando...' : 'Sentar Walk-in'}
        </button>
      </div>
    </div>
  );
};

export default WalkInModal;
