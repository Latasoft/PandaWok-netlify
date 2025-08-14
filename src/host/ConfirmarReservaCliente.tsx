import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ConfirmarReservaCliente = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<string>('Procesando tu reserva...');
  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;

    const confirmarReserva = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/reservas/accion/${token}`);
        setStatus(res.data);
        setSuccess(true);
      } catch (error: any) {
        console.error(error);
        setStatus(
          error.response?.data || 'Hubo un error al procesar la reserva. Intenta nuevamente.'
        );
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    confirmarReserva();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F7F7ED' }}>
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md text-center">
        {loading ? (
          <p className="text-orange-600 font-semibold">{status}</p>
        ) : (
          <>
            <p
              className={`font-semibold text-lg ${
                success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {status}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/"
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
              >
                Volver al inicio
              </Link>
              <Link
                to="/reservation"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                Hacer nueva reserva
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmarReservaCliente;
