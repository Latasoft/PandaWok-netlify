import React, { useState } from 'react';
import NewRequestModal from '../components/NewRequestModal'; // Esta importación es CORRECTA y NECESARIA

// Define una interfaz para los datos de la solicitud, similar a lo que enviará el modal
interface RequestData {
  telefono: string;
  email: string;
  clientTags: string[];
  reservationTags: string[];
  membershipNumber: string;
  reservationNote: string;
  file: string | null;
  fecha: string;
  hora: string;
  personas: number | '';
  tipoReserva: string;
  buscarComensal: string;
  nombre: string;
  apellido: string;
  // Añade cualquier otro campo que el modal devuelva
}

const RequestPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, ] = useState('Reserva más cercana');
  const [showFilters, setShowFilters] = useState(false);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false); // ¡Nuevo estado para el modal!

  const [requests, setRequests] = useState<RequestData[]>([]); // Para almacenar las solicitudes (mock)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCreateRequestClick = () => {
    setIsNewRequestModalOpen(true); // Abre el modal
  };

  const handleNewRequestCreated = (requestData: RequestData) => {
    console.log('Nueva solicitud creada:', requestData);
    // Aquí es donde enviarías `requestData` a tu backend para guardar la solicitud
    // Ejemplo: axios.post('/api/requests', requestData);

    // Para el ejemplo, la añadimos al estado local
    setRequests(prevRequests => [...prevRequests, requestData]);
    setIsNewRequestModalOpen(false); // Cierra el modal después de crear
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#211B17' }}>
      <h1 className="text-white text-2xl md:text-3xl font-semibold mb-6">Solicitudes de reserva</h1>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        {/* Barra de búsqueda */}
        <div className="relative flex-1 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar"
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-[#3C2022] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Botones de Ordenar y Filtros */}
        <div className="flex space-x-2 w-full md:w-auto justify-end">
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3C2022] text-white hover:bg-opacity-80 transition-colors text-sm"
            onClick={() => console.log('Ordenar por')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m-12 4h12m-12 4h12M4 7v10l3-3m0 0l-3-3" />
            </svg>
            <span>Ordenar por: {sortOrder}</span>
          </button>
          <button
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#3C2022] text-white hover:bg-opacity-80 transition-colors text-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>Filtros</span>
          </button>
        </div>

        {/* Botón "+ Solicitud" */}
        <button
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors w-full md:w-auto"
          onClick={handleCreateRequestClick} // ¡Ahora abre el modal!
        >
          + Solicitud
        </button>
      </div>

      {/* Contenedor de solicitudes */}
      <p className="text-gray-400 text-sm mb-4">Mostrando {requests.length} solicitudes</p>

      {requests.length === 0 ? (
        <div className="text-gray-400 text-center py-10">
          No hay solicitudes para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request, index) => (
            <div key={index} className="bg-[#3C2022] p-4 rounded-lg shadow-md text-white">
              <h3 className="text-lg font-semibold">{request.nombre} {request.apellido}</h3>
              <p>Fecha: {request.fecha} | Hora: {request.hora}</p>
              <p>Personas: {request.personas} | Tipo: {request.tipoReserva}</p>
              {request.telefono && <p>Teléfono: {request.telefono}</p>}
              {request.email && <p>Email: {request.email}</p>}
              {request.clientTags.length > 0 && <p>Tags Cliente: {request.clientTags.join(', ')}</p>}
              {/* Añade más detalles según necesites */}
              <div className="mt-4 flex justify-end space-x-2">
                <button className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Aceptar</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600">Rechazar</button>
              </div>
            </div>
          ))}
        </div>
      )}


      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#3C2022] p-6 rounded-lg text-white w-96">
            <h3 className="text-xl mb-4">Opciones de Filtro</h3>
            <p>Aquí van los controles para filtrar las solicitudes.</p>
            <button
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
              onClick={() => setShowFilters(false)}
            >
              Cerrar Filtros
            </button>
          </div>
        </div>
      )}

      {/* ¡Renderiza el nuevo modal aquí! */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onCreateRequest={handleNewRequestCreated}
      />
    </div>
  );
};

export default RequestPage;