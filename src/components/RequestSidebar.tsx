// src/components/RequestSidebar.tsx
import React from 'react';



interface RequestSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  // Podrías pasar las solicitudes de reserva aquí si las gestionas en el padre
  // requests: ReservationRequest[];
  // onUpdateRequestStatus: (requestId: string, status: 'confirmed' | 'rejected') => void;
}

const RequestSidebar: React.FC<RequestSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-full md:w-96 bg-[#212133] h-full shadow-lg p-6 flex flex-col">
        {/* Header del sidebar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Solicitudes de Reserva</h2>
          <button onClick={onClose} className="text-white hover:text-gray-300" aria-label="Cerrar solicitudes de reserva">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido de las solicitudes */}
        <div className="flex-1 overflow-y-auto text-white">
          <p className="text-gray-400 text-center mt-8">
            Aquí se mostrarían las solicitudes de reserva pendientes.
          </p>
         
        </div>
      </div>
    </div>
  );
};

export default RequestSidebar;