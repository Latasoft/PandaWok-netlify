import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';

type Props = {};

type ResumenWalkInData = {
  walkInsTotales: number;
  personasTotales: number;
};

const ResumenWalkIn: React.FC<Props> = () => {
  const [data, setData] = useState<ResumenWalkInData>({ walkInsTotales: 0, personasTotales: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get<ResumenWalkInData>(`${API_BASE_URL}/api/estadisticas/walkin/resumen`);
        setData(res.data);
        setError('');
      } catch {
        setError('Error al cargar las estadísticas de Walk-Ins');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_BASE_URL]);

  const chartData = {
    labels: ['Walk-Ins Totales', 'Personas Totales'],
    datasets: [
      {
        data: [data.walkInsTotales, data.personasTotales],
        backgroundColor: ['#3B82F6', '#6366F1'],
      },
    ],
  };

  if (loading) return <p className="text-center text-gray-500">Cargando estadísticas...</p>;
  if (error) return <p className="text-center text-red-600 font-semibold">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">Estadísticas de Walk-Ins</h2>
      <div className="flex justify-around mb-4">
        <div>
          <p className="text-gray-500 text-sm">Walk-Ins</p>
          <p className="text-3xl font-bold text-blue-500">{data.walkInsTotales}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Comensales</p>
          <p className="text-3xl font-bold text-indigo-500">{data.personasTotales}</p>
        </div>
      </div>
      <div className="max-w-xs mx-auto mb-4">
        <Pie
          data={chartData}
          options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
        />
      </div>
    </div>
  );
};

export default ResumenWalkIn;
