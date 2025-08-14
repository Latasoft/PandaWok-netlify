import React from 'react';
import { Pie } from 'react-chartjs-2';

type Props = {
  esperaTotal: number;
  personasTotales: number;
};

const ResumenListaEspera: React.FC<Props> = ({ esperaTotal, personasTotales }) => {
  const chartData = {
    labels: ['Clientes en Espera', 'Personas Totales'],
    datasets: [
      {
        data: [esperaTotal, personasTotales],
        backgroundColor: ['#EF4444', '#F87171'],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-red-600">Estadísticas de Lista de Espera</h2>
      <div className="flex justify-around mb-4">
        <div>
          <p className="text-gray-500 text-sm">Clientes en espera</p>
          <p className="text-3xl font-bold text-red-500">{esperaTotal}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Comensales</p>
          <p className="text-3xl font-bold text-pink-500">{personasTotales}</p>
        </div>
      </div>
      <div className="max-w-xs mx-auto mb-4">
        <Pie data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
};

export default ResumenListaEspera;
