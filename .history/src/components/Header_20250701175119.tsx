import React, { useState } from 'react';
import logo from '../assets/wokpanda-white.png';
import lockIcon from '../assets/icons-header/lock.png';
import requestIcon from '../assets/icons-header/request.png';
import walkingIcon from '../assets/icons-header/walkin.png';
import reserveIcon from '../assets/icons-header/reserve.png';
import BlockSidebar from './BlockSidebar';
import NewReservationModal from './NewReservationModal';

interface Salon {
  id: string;
  name: string;
  tables: any[];
}

interface HeaderProps {
  salones?: Salon[];
}

const Header: React.FC<HeaderProps> = ({ salones = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('Todo el día');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBlockSidebarOpen, setIsBlockSidebarOpen] = useState(false);
  const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const viewModes = ['Todo el día', 'Horario'];

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectViewMode = (mode: string) => {
    setViewMode(mode);
    setIsDropdownOpen(false);
  };

  return (

    <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4" style={{ backgroundColor: '#3C2022' }}>
      <div className="flex items-center space-x-2 md:space-x-4 w-full justify-between md:justify-start md:w-auto relative">
        <button 
          className="p-2 md:block" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Menú desplegable */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg z-50" style={{ backgroundColor: '#211B17' }}>
            <a 
              href="/" 
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm"
            >
              Planos de mesa
            </a>
            <a 
              href="/clientes" 
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm"
            >
              Clientes
            </a>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <img
            src={logo}
            alt="Wok Panda Logo"
            className="h-10 md:h-16 w-auto"
          />
        </div>
        <div className="flex md:hidden space-x-2 header-icons-container">
          <button 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsBlockSidebarOpen(true)}
          >
            <img src={lockIcon} alt="Bloqueos" className="header-icon-mobile" style={{width: '28px', height: '28px'}} />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <img src={requestIcon} alt="Solicitudes de reserva" style={{width: '28px', height: '28px'}} />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <img src={walkingIcon} alt="Walk-in" className="header-icon-mobile" style={{width: '28px', height: '28px'}} />
          </button>
          <button 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsNewReservationModalOpen(true)}
          >
            <img src={reserveIcon} alt="Nueva reserva" className="header-icon-mobile" style={{width: '28px', height: '28px'}} />
          </button>
        </div>
      </div>

              <div className="flex flex-wrap items-center justify-center space-x-2 md:space-x-6 flex-1 mt-3 md:mt-0 w-full md:w-auto">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-1 md:space-x-2 text-white hover:bg-white/10 px-2 md:px-3 py-1 md:py-2 rounded transition-colors text-sm md:text-base"
          >
            <span>{viewMode}</span>
            <svg className={`w-3 h-3 md:w-4 md:h-4 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7-7-7 7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 rounded-md shadow-lg z-50 min-w-[110px] md:min-w-[120px]" style={{ backgroundColor: '#211B17' }}>
              {viewModes.map((mode) => (
                <button
                  key={mode}
                  onClick={() => selectViewMode(mode)}
                  className="w-full text-left px-3 md:px-4 py-1 md:py-2 text-white text-sm md:text-base hover:bg-orange-500/20 first:rounded-t-md last:rounded-b-md transition-colors"
                >
                  {mode}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={goToToday}
          className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm font-medium hover:bg-orange-600 transition-colors whitespace-nowrap"
        >
          Ir a hoy
        </button>
        <div className="flex items-center space-x-1 md:space-x-2">
          <button onClick={goToPreviousDay} className="hover:bg-white/10 p-1 rounded transition-colors">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white text-xs md:text-base min-w-[80px] md:min-w-[100px] text-center">{formatDate(currentDate)}</span>
          <button onClick={goToNextDay} className="hover:bg-white/10 p-1 rounded transition-colors">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

              <div className="hidden md:flex items-center space-x-3 md:space-x-6 w-48 justify-end">
        <div className="relative group">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsBlockSidebarOpen(true)}
          >
            <img src={lockIcon} alt="Bloqueos" style={{width: '28px', height: '28px'}} />
          </button>
          <div className="absolute -bottom-8 right-0 w-24 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Bloqueos
          </div>
        </div>
        <div className="relative group">
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <img src={requestIcon} alt="Solicitudes de reserva" className="header-icon-mobile" style={{width: '28px', height: '28px'}} />
          </button>
          <div className="absolute -bottom-8 right-0 w-36 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Solicitudes de reserva
          </div>
        </div>
        <div className="relative group">
          <button className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <img src={walkingIcon} alt="Walk-in" style={{width: '28px', height: '28px'}} />
          </button>
          <div className="absolute -bottom-8 right-0 w-24 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Walk-in
          </div>
        </div>
        <div className="relative group">
          <button 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsNewReservationModalOpen(true)}
          >
            <img src={reserveIcon} alt="Nueva reserva" style={{width: '28px', height: '28px'}} />
          </button>
          <div className="absolute -bottom-8 right-0 w-28 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Nueva reserva
          </div>
        </div>
      </div>

      {/* Modal de Nueva Reserva */}
      <NewReservationModal
        isOpen={isNewReservationModalOpen}
        onClose={() => setIsNewReservationModalOpen(false)}
        onReservationCreate={(data) => {
          console.log('Nueva reserva creada:', data);
          setIsNewReservationModalOpen(false);
        }}
      />

      {/* Sidebar de Bloqueos */}
      <BlockSidebar
        isOpen={isBlockSidebarOpen}
        onClose={() => setIsBlockSidebarOpen(false)}
        salones={salones}
      />
    </div>
  );
};

export default Header;