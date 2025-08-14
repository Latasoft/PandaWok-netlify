import React, { useState } from 'react';
import Header from '../components/Header';
import NewReservationModal from '../components/NewReservationModal';
import ReservationDetailsPanel from '../components/ReservationDetailsPanel';
import NuevaMesaModal from './NuevaMesaModal';

interface Table {
  id: number;
  shape: 'round' | 'square' | 'rectangular';
  size: 'small' | 'medium' | 'large';
  occupied?: boolean;
  reserved?: boolean;
  reservationInfo?: {
    guestName: string;
    time: string;
    partySize: number;
    salon: string;
    notes?: string;
    origin?: 'Restaurant' | 'Web';
    createdAt?: string;
  };
}

interface Salon {
  id: string;
  name: string;
  tables: Table[];
}

interface NuevaMesaData {
  salonId: string;
  shape: 'round' | 'square' | 'rectangular';
  size: 'small' | 'medium' | 'large';
}

const Timeline: React.FC = () => {
  const [activeTab, setActiveTab] = useState('salon1A');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isReservationDetailsOpen, setIsReservationDetailsOpen] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState('reserva');
  const [isNuevaMesaModalOpen, setIsNuevaMesaModalOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const [salonsData, setSalonsData] = useState<Salon[]>([
    {
      id: 'salon1A',
      name: 'Salón 1 (A)',
      tables: [
        { id: 1, shape: 'round', size: 'small' },
        { id: 2, shape: 'round', size: 'small' },
        { id: 3, shape: 'round', size: 'small' },
        { id: 4, shape: 'round', size: 'small' },
        { id: 5, shape: 'round', size: 'small' },
        {
          id: 6,
          shape: 'square',
          size: 'medium',
          reserved: true,
          reservationInfo: {
            guestName: 'Carlos Rodriguez',
            time: '12:30 pm',
            partySize: 4,
            salon: 'Salón 1 (A)',
            notes: 'Asiento al lado de una ventana, por favor.',
            origin: 'Web',
            createdAt: '26/06/2025 a las 03:22 pm'
          }
        },
        { id: 7, shape: 'square', size: 'medium' },
        { id: 8, shape: 'square', size: 'medium' },
        { id: 9, shape: 'square', size: 'medium' },
        { id: 10, shape: 'square', size: 'large' },
        { id: 11, shape: 'rectangular', size: 'large' },
        { id: 12, shape: 'round', size: 'small' },
        { id: 13, shape: 'round', size: 'small' },
        { id: 14, shape: 'round', size: 'small' },
        { id: 15, shape: 'round', size: 'small' },
        { id: 16, shape: 'round', size: 'small' },
        { id: 17, shape: 'round', size: 'small' },
        { id: 18, shape: 'round', size: 'small' },
        { id: 19, shape: 'round', size: 'small' },
        { id: 20, shape: 'round', size: 'small' },
        { id: 160, shape: 'round', size: 'large' },
        { id: 161, shape: 'round', size: 'large' },
      ]
    },
    {
      id: 'salon1B',
      name: 'Salón 1 (B)',
      tables: []
    },
    {
      id: 'salon1C',
      name: 'Salón 1 (C)',
      tables: []
    },
    {
      id: 'salon2A',
      name: 'Salón 2 (A)',
      tables: []
    },
    {
      id: 'salon2B',
      name: 'Salón 2 (B)',
      tables: []
    },
    {
      id: 'salon2C',
      name: 'Salón 2 (C)',
      tables: []
    },
    {
      id: 'salonMesas',
      name: 'Salón Mesas Condición Especial',
      tables: []
    }
  ]);

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleNewReservation = () => {
    setIsReservationModalOpen(true);
  };

  const handleWalkIn = () => {
    console.log('Walk-in para mesa:', selectedTable?.id);
  };

  const handleCloseReservationModal = () => {
    setIsReservationModalOpen(false);
  };

  const handleCreateReservation = (reservationData: any) => {
    setSalonsData(prevSalons =>
      prevSalons.map(salon =>
        salon.id === activeTab
          ? {
              ...salon,
              tables: salon.tables.map(table =>
                table.id === reservationData.tableNumber
                  ? {
                      ...table,
                      reserved: true,
                      reservationInfo: {
                        guestName: reservationData.name,
                        time: reservationData.time,
                        partySize: reservationData.guests,
                        salon: salon.name,
                        notes: reservationData.notes,
                        origin: 'Restaurant',
                        createdAt: new Date().toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    }
                  : table
              )
            }
          : salon
      )
    );

    if (selectedTable?.id === reservationData.tableNumber) {
      const updatedTable = salonsData
        .find(salon => salon.id === activeTab)
        ?.tables.find(table => table.id === reservationData.tableNumber);
      if (updatedTable) {
        setSelectedTable({
          ...updatedTable,
          reserved: true,
          reservationInfo: {
            guestName: reservationData.name,
            time: reservationData.time,
            partySize: reservationData.guests,
            salon: salonsData.find(salon => salon.id === activeTab)?.name || '',
            notes: reservationData.notes,
            origin: 'Restaurant',
            createdAt: new Date().toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        });
      }
    }
  };

  const handleUpdateReservation = (tableId: number, updates: Partial<any>) => {
    setSalonsData(prevSalons =>
      prevSalons.map(salon => ({
        ...salon,
        tables: salon.tables.map(table =>
          table.id === tableId && table.reservationInfo
            ? {
                ...table,
                reservationInfo: {
                  ...table.reservationInfo,
                  ...updates
                }
              }
            : table
        )
      }))
    );

    if (selectedTable?.id === tableId) {
      setSelectedTable(prev => prev ? {
        ...prev,
        reservationInfo: prev.reservationInfo ? {
          ...prev.reservationInfo,
          ...updates
        } : undefined
      } : null);
    }
  };

  const getTableStyle = (table: Table) => {
    const baseClasses = "flex items-center justify-center text-white font-medium cursor-pointer transition-all duration-200 hover:scale-105";

    let shapeClasses = "";
    let sizeClasses = "";
    let bgColor = "bg-[#3C2022]";

    if (table.reserved) {
      bgColor = "bg-[#8B4513]";
    } else if (table.occupied) {
      bgColor = "bg-red-600";
    }

    switch (table.shape) {
      case 'round':
        shapeClasses = "rounded-full border-2 border-dashed border-orange-400";
        break;
      case 'square':
        shapeClasses = "border-2 border-orange-400";
        break;
      case 'rectangular':
        shapeClasses = "border-2 border-dashed border-orange-400";
        break;
    }

    switch (table.size) {
      case 'small':
        sizeClasses = "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-xs sm:text-sm";
        break;
      case 'medium':
        sizeClasses = "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-xs sm:text-base";
        break;
      case 'large':
        sizeClasses = table.shape === 'rectangular' 
          ? "w-14 h-10 sm:w-20 sm:h-12 md:w-24 md:h-16 text-xs sm:text-base" 
          : "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-xs sm:text-base md:text-lg";
        break;
    }

    const isSelected = selectedTable?.id === table.id;
    const selectionClass = isSelected ? "ring-2 ring-orange-400 ring-offset-2" : "";

    return `${baseClasses} ${shapeClasses} ${sizeClasses} ${selectionClass} ${bgColor}`;
  };

  const getTableGridPosition = (tableId: number) => {
    const positions: { [key: number]: string } = {
      1: "col-start-2 row-start-1",
      2: "col-start-4 row-start-1",
      3: "col-start-2 row-start-2",
      4: "col-start-4 row-start-2",
      5: "col-start-4 row-start-3",
      6: "col-start-2 row-start-3",
      7: "col-start-3 row-start-3",
      8: "col-start-2 row-start-4",
      9: "col-start-3 row-start-4",
      10: "col-start-2 row-start-5 col-span-2",
      11: "col-start-2 row-start-6 col-span-2",
      12: "col-start-6 row-start-6",
      13: "col-start-6 row-start-5",
      14: "col-start-6 row-start-4",
      15: "col-start-6 row-start-3",
      16: "col-start-6 row-start-2",
      17: "col-start-6 row-start-1",
      18: "col-start-5 row-start-1",
      19: "col-start-5 row-start-2",
      20: "col-start-5 row-start-3",
      160: "col-start-4 row-start-7",
      161: "col-start-3 row-start-7",
    };
    return positions[tableId] || "";
  };

  const currentSalon = salonsData.find(salon => salon.id === activeTab);

  const handleReservationCardClick = () => {
    if (selectedTable?.reserved && selectedTable?.reservationInfo) {
      setIsReservationDetailsOpen(true);
    }
  };

  const handleOpenNuevaMesaModal = () => {
    setIsNuevaMesaModalOpen(true);
  };

  const handleAddNewTable = (tableData: NuevaMesaData) => {
    const salon = salonsData.find(s => s.id === tableData.salonId);
    const newTableId = salon && salon.tables.length > 0 
      ? Math.max(...salon.tables.map(t => t.id)) + 1 
      : 1;

    setSalonsData(prevSalons =>
      prevSalons.map(salon =>
        salon.id === tableData.salonId
          ? {
              ...salon,
              tables: [
                ...salon.tables,
                {
                  id: newTableId,
                  shape: tableData.shape,
                  size: tableData.size
                }
              ]
            }
          : salon
      )
    );

    if (tableData.salonId !== activeTab) {
      setActiveTab(tableData.salonId);
    }
  };

  return (
    <div className="h-screen bg-slate-800 text-white flex flex-col">
      <Header salones={salonsData} />

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden relative">
        {/* Botón de alternancia para dispositivos móviles - Ajustado posicionamiento */}
        <button 
          className="md:hidden absolute top-2 left-2 z-10 bg-orange-500 p-2 rounded-full shadow-md"
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarVisible ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
        <div className={`flex flex-col border-r border-slate-700 w-full md:w-[350px] lg:w-[477px] ${!isSidebarVisible ? 'hidden md:flex' : 'flex'}`} style={{ backgroundColor: '#211B17' }}>
          <div className="p-4 pb-2">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar"
                className="w-full text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-600"
                style={{ backgroundColor: '#4c4037' }}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pt-2 flex flex-col">
            <div className="flex-1">
              {selectedTable ? (
                <div className="text-white">
                  {selectedTable.reserved && selectedTable.reservationInfo ? (
                    <div
                      className="rounded-lg p-4 space-y-4 cursor-pointer hover:bg-opacity-90 transition-all duration-200"
                      style={{ backgroundColor: '#F7F7ED' }}
                      onClick={handleReservationCardClick}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
                          {selectedTable.reservationInfo.guestName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="font-medium text-lg text-orange-400">{selectedTable.reservationInfo.guestName}</h3>
                        </div>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0114 0z" />
                            </svg>
                            <span className="text-gray-700">{selectedTable.reservationInfo.time}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="text-gray-700">{selectedTable.reservationInfo.partySize}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-gray-700">Mesa {selectedTable.id}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-gray-700">{selectedTable.reservationInfo.salon}</span>
                        </div>

                        {selectedTable.reservationInfo.notes && (
                          <div className="flex items-start space-x-2">
                            <svg className="w-4 h-4 mt-0.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-gray-700 leading-relaxed">{selectedTable.reservationInfo.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3 className="text-lg font-medium mb-2">Mesa {selectedTable.id}</h3>
                      <p className="text-gray-300 text-sm mb-4">Mesa disponible</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>No existen reservas para fecha seleccionada</p>
                </div>
              )}
            </div>

            {selectedTable && !selectedTable.reserved && (
              <div className="space-y-3 mt-4">
                <button
                  onClick={handleNewReservation}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nueva reserva</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={handleWalkIn}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Sentar Walk-in</span>
                  </button>

                  <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-3 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isReservationDetailsOpen ? (
          <div className="flex-1 bg-slate-100 flex flex-col timeline-container">
                          <div className="bg-white border-b border-gray-200">
              {/* Selector móvil de salones */}
              <div className="md:hidden flex items-center p-2 bg-white salon-selector-container">
                <select 
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent salon-selector"
                >
                  {salonsData.map((salon) => (
                    <option key={salon.id} value={salon.id}>
                      {salon.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleOpenNuevaMesaModal}
                  className="px-4 py-2 bg-[#FF6900] text-white font-medium rounded-r-md hover:bg-orange-600 transition-colors flex items-center justify-center shadow-md w-12"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>

              {/* Pestañas de escritorio */}
              <div className="hidden md:flex space-x-0 items-center min-w-max">
                {salonsData.map((salon) => (
                  <button
                    key={salon.id}
                    onClick={() => setActiveTab(salon.id)}
                    className={`px-3 sm:px-4 md:px-6 py-2 md:py-3 text-xs sm:text-sm font-medium border-r border-gray-200 transition-colors ${
                      activeTab === salon.id
                        ? 'bg-gray-50 text-gray-900 border-b-2 border-blue-500'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {salon.name}
                  </button>
                ))}
                <button
                  onClick={handleOpenNuevaMesaModal}
                  className="ml-2 px-4 py-2 bg-[#FF6900] text-white font-medium rounded-md hover:bg-orange-600 transition-colors flex items-center shadow-md"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Nueva mesa</span>
                </button>
              </div>
            </div>

                          <div className="p-4 md:p-6 lg:p-8 h-full overflow-auto">
              {currentSalon && currentSalon.tables.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 grid-rows-8 gap-2 md:gap-4 h-full max-w-4xl mx-auto timeline-grid">
                  {currentSalon.tables.map((table) => (
                    <div
                      key={table.id}
                      className={`${getTableStyle(table)} ${getTableGridPosition(table.id)}`}
                      onClick={() => handleTableClick(table)}
                    >
                      {table.id}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No hay mesas configuradas para este salón</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ReservationDetailsPanel
            isOpen={isReservationDetailsOpen}
            onClose={() => setIsReservationDetailsOpen(false)}
            table={selectedTable}
            activeTab={activeDetailsTab}
            setActiveTab={setActiveDetailsTab}
            onUpdateReservation={handleUpdateReservation}
          />
        )}
      </div>

      <NewReservationModal
        isOpen={isReservationModalOpen}
        onClose={handleCloseReservationModal}
        tableNumber={selectedTable?.id}
        onReservationCreate={handleCreateReservation}
      />

      <NuevaMesaModal
        isOpen={isNuevaMesaModalOpen}
        onClose={() => setIsNuevaMesaModalOpen(false)}
        onAddTable={handleAddNewTable}
        salons={salonsData}
      />
    </div>
  );
};

export default Timeline;
