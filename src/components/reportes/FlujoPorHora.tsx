import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import type { ChartOptions } from 'chart.js';
import 'chart.js/auto';

type FlujoHora = {
  hora: string;
  cantidad_personas: number;
};

const FlujoPorHora: React.FC = () => {
  const [flujoHora, setFlujoHora] = useState<FlujoHora[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchFlujo = async () => {
      try {
        setLoading(true);
        const res = await axios.get<FlujoHora[]>(`${API_BASE_URL}/api/estadisticas/flujo-hora`);
        setFlujoHora(res.data);
        setError('');
      } catch {
        setError('Error al cargar el flujo de comensales por hora');
      } finally {
        setLoading(false);
      }
    };

    fetchFlujo();
  }, [API_BASE_URL]);

  const chartData = {
    labels: flujoHora.map(f => f.hora),
    datasets: [
      {
        label: 'Cantidad de Personas',
        data: flujoHora.map(f => f.cantidad_personas),
        backgroundColor: '#6366F1',
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Cantidad de personas' },
      },
      x: {
        title: { display: true, text: 'Hora' },
      },
    },
  };

  if (loading) return <p className="text-center text-gray-500">Cargando datos...</p>;
  if (error) return <p className="text-center text-red-600 font-semibold">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600 text-center">
        Flujo de Comensales por Hora
      </h2>
      {flujoHora.length > 0 ? (
        <Bar data={chartData} options={options} />
      ) : (
        <p className="text-center text-gray-500">No hay datos de flujo por hora para mostrar.</p>
      )}
    </div>
  );
};

export default FlujoPorHora;
