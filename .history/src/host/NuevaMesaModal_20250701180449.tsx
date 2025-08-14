import React, { useState } from 'react';

interface TableCapacity {
  shape: 'round' | 'square' | 'rectangular';
  size: 'small' | 'medium' | 'large';
  capacity: number[];
}

export interface NuevaMesaData {
  shape: 'round' | 'square' | 'rectangular';
  size: 'small' | 'medium' | 'large';
  salonId: string;
}

interface NuevaMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTable: (tableData: NuevaMesaData) => void;
  salons: { id: string; name: string }[];
}

const NuevaMesaModal: React.FC<NuevaMesaModalProps> = ({ isOpen, onClose, onAddTable, salons }) => {
  const [selectedShape, setSelectedShape] = useState<'round' | 'square' | 'rectangular'>('round');
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('small');
  const [selectedSalon, setSelectedSalon] = useState(salons[0]?.id || '');

  const tableCapacities: Record<string, TableCapacity[]> = {
    round: [
      { shape: 'round', size: 'small', capacity: [1, 2, 4] },
      { shape: 'round', size: 'medium', capacity: [6] },
      { shape: 'round', size: 'large', capacity: [8] }
    ],
    rectangular: [
      { shape: 'rectangular', size: 'small', capacity: [6, 8] },
      { shape: 'rectangular', size: 'medium', capacity: [10] },
      { shape: 'rectangular', size: 'large', capacity: [14] }
    ],
    square: [
      { shape: 'square', size: 'small', capacity: [2] },
      { shape: 'square', size: 'medium', capacity: [4] },
      { shape: 'square', size: 'large', capacity: [6] }
    ]
  };

  const getCurrentCapacity = (): number[] => {
    const tableOption = tableCapacities[selectedShape].find(
      option => option.size === selectedSize
    );
    return tableOption?.capacity || [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTable({
      shape: selectedShape,
      size: selectedSize,
      salonId: selectedSalon
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 md:p-0 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden transform transition-all animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 bg-gradient-to-r from-[#FF6900] via-orange-400 to-orange-300 relative">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white drop-shadow-sm">Agregar nueva mesa</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-100 transition-colors p-2 hover:bg-black hover:bg-opacity-10 rounded-full"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute -bottom-4 left-0 right-0 flex justify-center">
            <div className="h-1 w-16 bg-orange-500 rounded-full"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6 space-y-2 max-h-[70vh] overflow-y-auto">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
              <label className="block text-gray-700 font-medium mb-2">Seleccione el salón</label>
              <div className="relative">
                <select
                  className="w-full p-3 pl-4 pr-10 appearance-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6900] focus:border-[#FF6900] bg-white text-gray-800"
                  value={selectedSalon}
                  onChange={(e) => setSelectedSalon(e.target.value)}
                  required
                >
                  {salons.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-orange-50 p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-[#FF6900] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <label className="text-gray-700 font-medium text-lg">Forma de la mesa</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedShape('round')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedShape === 'round' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedShape === 'round' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-5 flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-white shadow-md border-4 border-orange-200 flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-[#FF6900] opacity-20"></div>
                    </div>
                    <span className="text-gray-800 font-medium text-base">Redonda</span>
                    {selectedShape === 'round' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('square')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedShape === 'square' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedShape === 'square' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-5 flex flex-col items-center">
                    <div className="w-20 h-20 bg-white shadow-md border-4 border-orange-200 flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-[#FF6900] opacity-20"></div>
                    </div>
                    <span className="text-gray-800 font-medium text-base">Cuadrada</span>
                    {selectedShape === 'square' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedShape('rectangular')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedShape === 'rectangular' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedShape === 'rectangular' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-5 flex flex-col items-center">
                    <div className="w-24 h-16 bg-white shadow-md border-4 border-orange-200 flex items-center justify-center mb-3">
                      <div className="w-16 h-8 bg-[#FF6900] opacity-20"></div>
                    </div>
                    <span className="text-gray-800 font-medium text-base">Rectangular</span>
                    {selectedShape === 'rectangular' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-orange-50 p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-[#FF6900] mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 4.5A2.5 2.5 0 014.5 2h11a2.5 2.5 0 010 5h-11A2.5 2.5 0 012 4.5zM2.75 9.083a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 12.663a.75.75 0 000 1.5h14.5a.75.75 0 000-1.5H2.75zM2.75 16.25a.75.75 0 000 1.5h14.5a.75.75 0 100-1.5H2.75z" />
                </svg>
                <label className="text-gray-700 font-medium text-lg">Tamaño de la mesa</label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedSize('small')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedSize === 'small' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedSize === 'small' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-4 flex flex-col items-center">
                    <div className="relative mb-2">
                      {selectedShape === 'round' && (
                        <div className="w-12 h-12 rounded-full bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'square' && (
                        <div className="w-12 h-12 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-6 h-6 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'rectangular' && (
                        <div className="w-16 h-10 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-10 h-5 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#FF6900] text-white text-xs font-bold px-2 py-1 rounded-full mb-1">S</div>
                    <span className="text-gray-800 font-medium">Pequeña</span>
                    {selectedSize === 'small' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSize('medium')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedSize === 'medium' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedSize === 'medium' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-4 flex flex-col items-center">
                    <div className="relative mb-2">
                      {selectedShape === 'round' && (
                        <div className="w-16 h-16 rounded-full bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-9 h-9 rounded-full bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'square' && (
                        <div className="w-16 h-16 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-9 h-9 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'rectangular' && (
                        <div className="w-20 h-14 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-14 h-8 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#FF6900] text-white text-xs font-bold px-2 py-1 rounded-full mb-1">M</div>
                    <span className="text-gray-800 font-medium">Mediana</span>
                    {selectedSize === 'medium' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSize('large')}
                  className={`relative overflow-hidden group rounded-xl transition-all duration-300 ${selectedSize === 'large' ? 'ring-2 ring-[#FF6900] shadow-lg' : 'hover:shadow-md'}`}
                >
                  <div className={`absolute inset-0 ${selectedSize === 'large' ? 'bg-orange-100' : 'bg-gray-100 group-hover:bg-orange-50'} transition-colors duration-300`}></div>
                  <div className="relative p-4 flex flex-col items-center">
                    <div className="relative mb-2">
                      {selectedShape === 'round' && (
                        <div className="w-20 h-20 rounded-full bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'square' && (
                        <div className="w-20 h-20 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-12 h-12 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                      {selectedShape === 'rectangular' && (
                        <div className="w-24 h-16 bg-white shadow border-2 border-orange-300 flex items-center justify-center">
                          <div className="w-16 h-10 bg-[#FF6900] opacity-20"></div>
                        </div>
                      )}
                    </div>
                    <div className="bg-[#FF6900] text-white text-xs font-bold px-2 py-1 rounded-full mb-1">L</div>
                    <span className="text-gray-800 font-medium">Grande</span>
                    {selectedSize === 'large' && (
                      <div className="absolute top-2 right-2 bg-[#FF6900] rounded-full p-1 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-b from-white to-orange-50 p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
              <div className="flex items-center mb-4">
                <svg className="w-5 h-5 text-[#FF6900] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <label className="text-gray-700 font-medium text-lg">Capacidad</label>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#FF6900] to-orange-500 shadow-md">
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-90"></div>
                <div className="relative p-6 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <div className="flex mb-1">
                      {[...Array(Math.min(Math.max(...getCurrentCapacity()), 8))].map((_, i) => (
                        <div key={i} className="mx-1">
                          <svg className="w-7 h-7 text-[#FF6900]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#FF6900] py-2 px-6 rounded-full shadow-md">
                      <span className="text-2xl font-bold text-white">
                        {getCurrentCapacity().join(' - ')} {getCurrentCapacity().length === 1 && getCurrentCapacity()[0] === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex items-center mb-3">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h4 className="font-medium text-blue-800">Información de capacidad:</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="bg-white bg-opacity-60 p-2 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-1 border-b border-blue-100 pb-1">Mesas redondas</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Pequeña: 1-2-4 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Mediana: 6 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Grande: 8 personas</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-60 p-2 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-1 border-b border-blue-100 pb-1">Mesas rectangulares</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Pequeña: 6-8 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Mediana: 10 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Grande: 14 personas</li>
                  </ul>
                </div>
                <div className="bg-white bg-opacity-60 p-2 rounded-lg">
                  <h5 className="font-medium text-blue-700 mb-1 border-b border-blue-100 pb-1">Mesas cuadradas</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Pequeña: 2 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Mediana: 4 personas</li>
                    <li className="flex items-center"><span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>Grande: 6 personas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-5 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors flex justify-center items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#FF6900] text-white rounded-lg font-medium hover:bg-orange-700 transition-colors flex justify-center items-center shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Agregar mesa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NuevaMesaModal;
