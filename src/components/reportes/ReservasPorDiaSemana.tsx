import { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import 'chart.js/auto';

type ReservaDia = {
  dia: string;
  cantidad: number;
};

const ReservasPorDiaSemana = () => {
  const [datos, setDatos] = useState<ReservaDia[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchDatos();
  }, []);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const res = await axios.get<ReservaDia[]>(`${API_BASE_URL}/api/estadisticas/reservas-por-dia`);
      setDatos(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar las reservas por día');
    } finally {
      setLoading(false);
    }
  };

  const coloresBarras = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#F43F5E'];

  const chartData = {
    labels: datos.map((d) => d.dia),
    datasets: [
      {
        label: 'Cantidad de Reservas',
        data: datos.map((d) => d.cantidad),
        backgroundColor: datos.map((_, i) => coloresBarras[i % coloresBarras.length]),
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true, mode: 'index', intersect: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Reservas',
          font: { size: 14, weight: 'bold' },
          color: '#374151',
        },
        ticks: {
          stepSize: 1,
          color: '#4B5563',
          font: { size: 12 },
        },
        grid: {
          color: '#E5E7EB',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Día de la Semana',
          font: { size: 14, weight: 'bold' },
          color: '#374151',
        },
        ticks: {
          color: '#4B5563',
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <section className="bg-white rounded-xl shadow-md max-w-4xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Reservas por Día de la Semana</h2>

      {loading && <p className="text-center text-gray-500 italic">Cargando datos...</p>}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

      {!loading && !error && datos.length === 0 && (
        <p className="text-center text-gray-400 italic">No hay datos para mostrar.</p>
      )}

      {!loading && !error && datos.length > 0 && (
        <Bar data={chartData} options={chartOptions} />
      )}
    </section>
  );
};

export default ReservasPorDiaSemana;
