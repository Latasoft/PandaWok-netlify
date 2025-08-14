import React from 'react';
import { Pie } from 'react-chartjs-2';

type Props = {
  walkInsTotales: number;
  personasTotales: number;
};

const ResumenWalkIn: React.FC<Props> = ({ walkInsTotales, personasTotales }) => {
  const chartData = {
    labels: ['Walk-Ins Totales', 'Personas Totales'],
    datasets: [
      {
        data: [walkInsTotales, personasTotales],
        backgroundColor: ['#3B82F6', '#6366F1'],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">Estadísticas de Walk-Ins</h2>
      <div className="flex justify-around mb-4">
        <div>
          <p className="text-gray-500 text-sm">Walk-Ins</p>
          <p className="text-3xl font-bold text-blue-500">{walkInsTotales}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Comensales</p>
          <p className="text-3xl font-bold text-indigo-500">{personasTotales}</p>
        </div>
      </div>
      <div className="max-w-xs mx-auto mb-4">
        <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
};

export default ResumenWalkIn;
