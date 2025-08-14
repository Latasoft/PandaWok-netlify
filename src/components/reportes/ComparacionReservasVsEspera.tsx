import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';
import axios from 'axios';

type ComparacionData = {
  reservasTotales: number;
  listaEsperaTotal: number;
};

const ComparacionReservasVsEspera: React.FC = () => {
  const [data, setData] = useState<ComparacionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get<ComparacionData>(`${API_BASE_URL}/api/estadisticas/reservas-vs-lista-espera`);
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los datos de reservas y lista de espera');
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ['Reservas', 'Lista de Espera'],
    datasets: [
      {
        label: 'Cantidad',
        data: data ? [data.reservasTotales, data.listaEsperaTotal] : [0, 0],
        backgroundColor: ['#10B981', '#F87171'],
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad' },
      },
      y: {
        title: { display: false },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-violet-600 text-center">
        Comparación: Reservas vs Lista de Espera
      </h2>

      {loading && <p className="text-center text-gray-500 italic">Cargando datos...</p>}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}

      {!loading && !error && data && <Bar data={chartData} options={options} />}
    </div>
  );
};

export default ComparacionReservasVsEspera;
