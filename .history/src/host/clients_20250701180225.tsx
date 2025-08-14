import React, { useState } from 'react';
import Header from '../components/Header';

interface Client {
  nombre: string;
  telefono: string;
  correoElectronico: string;
  visitas: number;
  ultimaVisita?: string;
  tagsDelCliente?: string[];
  gastoTotal: number;
  gastoPorVisita: number;
  notaDelPerfil?: string;
}

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="min-h-screen bg-[#3C2022]">
      <Header />
      <div className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold mb-4 md:mb-0 text-[#F7F7ED]">Clientes</h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Buscar"
              className="px-4 py-2 rounded-md bg-[#211B17] border border-[#F7F7ED] text-[#F7F7ED] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded-md border border-[#F7F7ED] text-[#F7F7ED] hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Tags
                </span>
              </button>
              <button className="px-3 py-2 rounded-md border border-[#F7F7ED] text-[#F7F7ED] hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filtrar
                </span>
              </button>
              <button className="px-3 py-2 rounded-md border border-[#F7F7ED] text-[#F7F7ED] hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </span>
              </button>
              <button className="px-4 py-2 bg-orange-500 text-[#F7F7ED] rounded-md hover:bg-orange-600 transition-colors">
                + Cliente
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto bg-[#F7F7ED] rounded-lg shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#3C2022]/20">
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Nombre</th>
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Teléfono</th>
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Correo Electrónico</th>
                <th className="py-3 px-4 text-center text-[#3C2022] font-semibold">Visitas</th>
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Última Visita</th>
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Tags del cliente</th>
                <th className="py-3 px-4 text-right text-[#3C2022] font-semibold">Gasto total</th>
                <th className="py-3 px-4 text-right text-[#3C2022] font-semibold">Gasto/Visita</th>
                <th className="py-3 px-4 text-left text-[#3C2022] font-semibold">Nota del perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3C2022]/20">
              <tr className="hover:bg-[#3C2022]/5 transition-colors">
                <td className="py-3 px-4 text-[#3C2022]">Alejandro Garay</td>
                <td className="py-3 px-4 text-[#3C2022]">+{56} 09 4507 8880</td>
                <td className="py-3 px-4 text-[#3C2022]">aleleon_237@hotmail.com</td>
                <td className="py-3 px-4 text-center text-[#3C2022]">0</td>
                <td className="py-3 px-4 text-[#3C2022]">-</td>
                <td className="py-3 px-4 text-[#3C2022]">-</td>
                <td className="py-3 px-4 text-right text-[#3C2022]">0.00</td>
                <td className="py-3 px-4 text-right text-[#3C2022]">0.00</td>
                <td className="py-3 px-4 text-[#3C2022]">-</td>
              </tr>
              {/* Más filas aquí... */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients;