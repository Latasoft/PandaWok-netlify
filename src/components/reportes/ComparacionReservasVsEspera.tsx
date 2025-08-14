import React from 'react';
import { Bar } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

type Props = {
  reservasTotales: number;
  listaEsperaTotal: number;
};

const ComparacionReservasVsEspera: React.FC<Props> = ({ reservasTotales, listaEsperaTotal }) => {
  const chartData = {
    labels: ['Reservas', 'Lista de Espera'],
    datasets: [
      {
        label: 'Cantidad',
        data: [reservasTotales, listaEsperaTotal],
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ComparacionReservasVsEspera;
