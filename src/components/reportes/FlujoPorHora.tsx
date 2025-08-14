import React from 'react';
import { Bar } from 'react-chartjs-2';

type FlujoHora = {
  hora: string;
  cantidad_personas: number;
};

type Props = {
  flujoHora: FlujoHora[];
};

const FlujoPorHora: React.FC<Props> = ({ flujoHora }) => {
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

  const options = {
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
