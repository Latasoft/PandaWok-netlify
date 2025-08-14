import React from 'react';
import { Pie } from 'react-chartjs-2';

type Props = {
  reservasTotales: number;
  comensalesTotales: number;
};

const ResumenReservas: React.FC<Props> = ({ reservasTotales, comensalesTotales }) => {
  // Base URL de la API por si se necesita en el futuro
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const chartData = {
    labels: ['Reservas Totales', 'Comensales Totales'],
    datasets: [
      {
        data: [reservasTotales, comensalesTotales],
        backgroundColor: ['#F97316', '#10B981'],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-orange-600">Estadísticas de Reservas</h2>
      <div className="flex justify-around mb-4">
        <div>
          <p className="text-gray-500 text-sm">Reservas</p>
          <p className="text-3xl font-bold text-orange-500">{reservasTotales}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Comensales</p>
          <p className="text-3xl font-bold text-emerald-500">{comensalesTotales}</p>
        </div>
      </div>
      <div className="max-w-xs mx-auto mb-4">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
          }}
        />
      </div>
    </div>
  );
};

export default ResumenReservas;
