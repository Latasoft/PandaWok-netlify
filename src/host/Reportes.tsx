import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie, Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import 'chart.js/auto';
import type { ChartOptions } from 'chart.js';

import ReservasPorDiaSemana from '../components/reportes/ReservasPorDiaSemana';
import EstadisticasPorGrupo from '../components/reportes/ReservaPorGrupo';
import ComensalesPorDiaSemana from '../components/reportes/ComensalesPorSemana';
import ListaReservas from '../components/reportes/Reservas'

type Resumen = {
  reservasTotales: number;
  comensalesTotales: number;
};

type WalkInResumen = {
  walkInsTotales: number;
  personasTotales: number;
};

type ListaEsperaResumen = {
  esperaTotal: number;
  personasTotales: number;
};

type FlujoHora = {
  hora: string;
  cantidad_personas: number;
};

const ListaEsperaResumenCard = ({ resumen }: { resumen: ListaEsperaResumen }) => {
  const data = {
    labels: ['Clientes en Espera', 'Personas Totales'],
    datasets: [
      {
        data: [resumen.esperaTotal, resumen.personasTotales],
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
          <p className="text-3xl font-bold text-red-500">{resumen.esperaTotal}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Comensales</p>
          <p className="text-3xl font-bold text-pink-500">{resumen.personasTotales}</p>
        </div>
      </div>
      <div className="max-w-xs mx-auto mb-4">
        <Pie data={data} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>
    </div>
  );
};

const FlujoPorHoraChart = ({ flujoHora }: { flujoHora: FlujoHora[] }) => {
  const data = {
    labels: flujoHora.map((f) => f.hora),
    datasets: [
      {
        label: 'Cantidad de Personas',
        data: flujoHora.map((f) => f.cantidad_personas),
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

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-8 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600 text-center">Flujo de Comensales por Hora</h2>
      {flujoHora.length > 0 ? (
        <Bar data={data} options={options} />
      ) : (
        <p className="text-center text-gray-500">No hay datos de flujo por hora para mostrar.</p>
      )}
    </div>
  );
};

const ComparacionReservasVsEspera = ({ reservas, espera }: { reservas: number; espera: number }) => {
  const data = {
    labels: ['Reservas', 'Lista de Espera'],
    datasets: [
      {
        label: 'Cantidad',
        data: [reservas, espera],
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
      <h2 className="text-xl font-semibold mb-4 text-violet-600 text-center">Comparación: Reservas vs Lista de Espera</h2>
      <Bar data={data} options={options} />
    </div>
  );
};

const Reportes: React.FC = () => {
  const [resumen, setResumen] = useState<Resumen>({ reservasTotales: 0, comensalesTotales: 0 });
  const [walkinResumen, setWalkinResumen] = useState<WalkInResumen>({ walkInsTotales: 0, personasTotales: 0 });
  const [listaEsperaResumen, setListaEsperaResumen] = useState<ListaEsperaResumen>({ esperaTotal: 0, personasTotales: 0 });
  const [flujoHora, setFlujoHora] = useState<FlujoHora[]>([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [vista, setVista] = useState<'estadisticas' | 'reservas'>('estadisticas');

  useEffect(() => {
    fetchTodosBasico();
  }, []);

  const fetchTodosBasico = async () => {
    setLoading(true);
    try {
      const [resReservas, resWalkin, resListaEspera] = await Promise.all([
        axios.get<Resumen>('http://localhost:5000/api/estadisticas/resumen'),
        axios.get<WalkInResumen>('http://localhost:5000/api/estadisticas/walkin/resumen'),
        axios.get<ListaEsperaResumen>('http://localhost:5000/api/estadisticas/lista-espera/resumen'),
      ]);
      setResumen(resReservas.data);
      setWalkinResumen(resWalkin.data);
      setListaEsperaResumen(resListaEspera.data);
      setFlujoHora([]);
      setError('');
    } catch {
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodosPorFecha = async () => {
    if (!startDate || !endDate) {
      setError('Selecciona ambas fechas');
      return;
    }
    setLoading(true);
    try {
      const [resReservas, resWalkin, resListaEspera, resFlujoHora] = await Promise.all([
        axios.get<Resumen>(`http://localhost:5000/api/estadisticas/resumen-fecha?startDate=${startDate}&endDate=${endDate}`),
        axios.get<WalkInResumen>(`http://localhost:5000/api/estadisticas/walkin/resumen-fecha?startDate=${startDate}&endDate=${endDate}`),
        axios.get<ListaEsperaResumen>(`http://localhost:5000/api/estadisticas/lista-espera/resumen-fecha?startDate=${startDate}&endDate=${endDate}`),
        axios.get<FlujoHora[]>(`http://localhost:5000/api/estadisticas/flujo-hora?startDate=${startDate}&endDate=${endDate}`),
      ]);
      setResumen(resReservas.data);
      setWalkinResumen(resWalkin.data);
      setListaEsperaResumen(resListaEspera.data);
      setFlujoHora(resFlujoHora.data);
      setError('');
    } catch {
      setError('Error al filtrar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const wsData = [
      ['Tipo', 'Total', 'Personas'],
      ['Reservas', resumen.reservasTotales, resumen.comensalesTotales],
      ['Walk-Ins', walkinResumen.walkInsTotales, walkinResumen.personasTotales],
      ['Lista de Espera', listaEsperaResumen.esperaTotal, listaEsperaResumen.personasTotales],
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Estadísticas');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'resumen-estadisticas.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-8">Reportes</h1>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setVista('estadisticas')}
          className={`px-6 py-2 rounded-md font-semibold shadow-md ${
            vista === 'estadisticas' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Estadísticas
        </button>
        <button
          onClick={() => setVista('reservas')}
          className={`px-6 py-2 rounded-md font-semibold shadow-md ${
            vista === 'reservas' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Reservas
        </button>
      </div>

      {vista === 'estadisticas' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchTodosPorFecha();
          }}
          className="flex flex-col sm:flex-row justify-center gap-4 mb-8"
        >
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border px-4 py-2 rounded-md" />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border px-4 py-2 rounded-md" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md">
            Filtrar por fecha
          </button>
          <button
            type="button"
            onClick={fetchTodosBasico}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-md shadow-md"
          >
            Mostrar todo
          </button>
        </form>
      )}

      {error && <p className="text-center text-red-600 mb-6">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Cargando datos...</p>
      ) : vista === 'estadisticas' ? (
        <>
          <div className="flex flex-wrap justify-center gap-6 mb-8">
            {/* Cards */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center w-72">
              <h2 className="text-xl font-semibold mb-4 text-orange-600">Estadísticas de Reservas</h2>
              <div className="flex justify-around mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Reservas</p>
                  <p className="text-3xl font-bold text-orange-500">{resumen.reservasTotales}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Comensales</p>
                  <p className="text-3xl font-bold text-emerald-500">{resumen.comensalesTotales}</p>
                </div>
              </div>
              <div className="max-w-xs mx-auto mb-4">
                <Pie
                  data={{
                    labels: ['Reservas Totales', 'Comensales Totales'],
                    datasets: [
                      {
                        data: [resumen.reservasTotales, resumen.comensalesTotales],
                        backgroundColor: ['#F97316', '#10B981'],
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>

            {/* Walk-in */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center w-72">
              <h2 className="text-xl font-semibold mb-4 text-blue-600">Estadísticas de Walk-Ins</h2>
              <div className="flex justify-around mb-4">
                <div>
                  <p className="text-gray-500 text-sm">Walk-Ins</p>
                  <p className="text-3xl font-bold text-blue-500">{walkinResumen.walkInsTotales}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Comensales</p>
                  <p className="text-3xl font-bold text-indigo-500">{walkinResumen.personasTotales}</p>
                </div>
              </div>
              <div className="max-w-xs mx-auto mb-4">
                <Pie
                  data={{
                    labels: ['Walk-Ins Totales', 'Personas Totales'],
                    datasets: [
                      {
                        data: [walkinResumen.walkInsTotales, walkinResumen.personasTotales],
                        backgroundColor: ['#3B82F6', '#6366F1'],
                      },
                    ],
                  }}
                  options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
                />
              </div>
            </div>

            {/* Lista de espera */}
            <div className="w-72">
              <ListaEsperaResumenCard resumen={listaEsperaResumen} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <ReservasPorDiaSemana />
            <ComensalesPorDiaSemana />
            <EstadisticasPorGrupo />
            <FlujoPorHoraChart flujoHora={flujoHora} />
          </div>

          <ComparacionReservasVsEspera reservas={resumen.reservasTotales} espera={listaEsperaResumen.esperaTotal} />

          <div className="text-center mt-8">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md shadow-md"
            >
              Exportar todo a Excel
            </button>
          </div>
        </>
      ) : (
        <ListaReservas />
      )}
    </div>
  );
};

export default Reportes;
