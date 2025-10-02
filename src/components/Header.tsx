import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';

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

interface BlockData {
  date: string;
  allDay: boolean;
  timeFrom: string | null;
  timeTo: string | null;
  area: string;
  applyTo: 'all' | 'min_persons' | 'max_persons';
  personsCount: number | null;
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
  const [userName, setUserName] = useState(''); // Reintroducing userName state from the first snippet

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewModes = ['Todo el día', 'Horario'];

  // Reintroducing useEffect for userName from the first snippet
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.nombre_usuario || '');
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUserName('');
      }
    }
  }, []);

  // Sincronizar fecha del header con URL cuando estamos en timeline
  useEffect(() => {
    if (location.pathname === '/timeline') {
      const fechaParam = searchParams.get('fecha');
      if (fechaParam) {
        const fechaFromURL = new Date(fechaParam + 'T00:00:00');
        if (!isNaN(fechaFromURL.getTime())) {
          setCurrentDate(fechaFromURL);
          console.log('📅 [HEADER LAYOUT - SYNC FROM URL] Sincronizando fecha desde URL:', {
            fechaURL: fechaParam,
            fechaSincronizada: fechaFromURL.toISOString().split('T')[0],
            timestamp: new Date().toISOString()
          });
        }
      }
    }
  }, [location.pathname, searchParams]);

  // Reintroducing logout function from the first snippet
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Función auxiliar para actualizar la URL si estamos en timeline
  const updateTimelineDateURL = (newDate: Date) => {
    if (location.pathname === '/timeline') {
      const params = new URLSearchParams(searchParams);
      params.set('fecha', newDate.toISOString().split('T')[0]);
      setSearchParams(params);
    }
  };

  const goToToday = () => {
    const newDate = new Date();
    console.log('📅 [HEADER LAYOUT - GO TO TODAY] Navegando a hoy:', {
      fechaAnterior: currentDate.toISOString().split('T')[0],
      fechaNueva: newDate.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    setCurrentDate(newDate);
    updateTimelineDateURL(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    console.log('📅 [HEADER LAYOUT - PREVIOUS DAY] Navegando al día anterior:', {
      fechaAnterior: currentDate.toISOString().split('T')[0],
      fechaNueva: newDate.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    setCurrentDate(newDate);
    updateTimelineDateURL(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    console.log('📅 [HEADER LAYOUT - NEXT DAY] Navegando al día siguiente:', {
      fechaAnterior: currentDate.toISOString().split('T')[0],
      fechaNueva: newDate.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });
    setCurrentDate(newDate);
    updateTimelineDateURL(newDate);
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Ensure click outside menu closes it, but not if the click is on the menu button itself
      if (isMenuOpen && !target.closest('.menu-container') && !target.closest('[aria-label="Toggle menu"]')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleBlockCreate = (blockData: BlockData) => {
    console.log('Nuevo bloqueo creado:', blockData);
    // ... logic to send to backend ...
  };

  const handleGoToRequests = () => {
    navigate('/solicitudes');
  };

  const handleGoToWalkinPage = () => {
    navigate('/lista-espera');
  };

  const handleGoToUsersPage = () => {
    navigate('/admin/usuarios');
    setIsMenuOpen(false); // Close menu after navigating
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-2 md:p-4" style={{ backgroundColor: '#3C2022' }}>
      <div className="flex items-center space-x-2 md:space-x-4 w-full justify-between md:justify-start md:w-auto relative menu-container">
        <button
          className="p-2 md:block"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {isMenuOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-48 rounded-md shadow-lg z-50"
            style={{
              backgroundColor: '#3C2022',
              border: '1px solid #F7F7ED'
            }}
          >
            <Link
              to="/timeline"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              Planos de mesa
            </Link>
            <Link
              to="/clientes"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              Clientes
            </Link>
            <button
              onClick={handleGoToUsersPage}
              className="w-full text-left px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm"
            >
              Usuarios
            </button>
            <Link
              to="/bloqueos"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              bloqueos
            </Link>
            <Link
              to="/Reportes"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              Reportes
            </Link>
            <Link
              to="/confirmar-reserva"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              Confirmar Reserva
            </Link>

            <Link
              to="/Admin"
              className="block px-4 py-2 text-white hover:bg-orange-500/20 transition-colors text-sm border-b border-[#F7F7ED]"
              onClick={() => setIsMenuOpen(false)}
            >
              Admin
            </Link>
            {/* Added a separator and user info/logout from the first snippet */}
            <div className="border-t border-[#F7F7ED] my-1" />
            <div className="px-4 py-2 text-white text-sm">
              {userName && <p className="mb-2">Hola, <span className="font-semibold">{userName}</span></p>}
              <button onClick={logout} className="text-red-400 hover:text-red-200 text-sm">Cerrar sesión</button>
            </div>
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
            aria-label="Bloqueos"
          >
            <img src={lockIcon} alt="Bloqueos" className="header-icon-mobile" style={{ width: '28px', height: '28px' }} />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={handleGoToRequests}
            aria-label="Solicitudes de reserva"
          >
            <img src={requestIcon} alt="Solicitudes de reserva" style={{ width: '28px', height: '28px' }} />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={handleGoToWalkinPage}
            aria-label="Walk-in"
          >
            <img src={walkingIcon} alt="Walk-in" className="header-icon-mobile" style={{ width: '28px', height: '28px' }} />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsNewReservationModalOpen(true)}
            aria-label="Nueva reserva"
          >
            <img src={reserveIcon} alt="Nueva reserva" className="header-icon-mobile" style={{ width: '28px', height: '28px' }} />
          </button>
        </div>
      </div>

      {/* Mostrar nombre del usuario en la parte derecha del header (Desktop Only) */}
      {/* This was present in the first snippet but removed in the second. Reintroducing it as it's useful. */}
      {userName && (
        <div className="hidden md:flex items-center space-x-2 text-white text-sm font-medium ml-auto mr-4">
          <span>Hola,</span>
          <span className="font-semibold">{userName}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center space-x-2 md:space-x-6 flex-1 mt-3 md:mt-0 w-full md:w-auto">
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-1 md:space-x-2 text-white hover:bg-white/10 px-2 md:px-3 py-1 md:py-2 rounded transition-colors text-sm md:text-base"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
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
          <button onClick={goToPreviousDay} className="hover:bg-white/10 p-1 rounded transition-colors" aria-label="Día anterior">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-white text-xs md:text-base min-w-[80px] md:min-w-[100px] text-center">{formatDate(currentDate)}</span>
          <button onClick={goToNextDay} className="hover:bg-white/10 p-1 rounded transition-colors" aria-label="Día siguiente">
            <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Íconos de acción para desktop */}
      {/* These were explicitly added and styled in the second snippet. */}
      <div className="hidden md:flex items-center space-x-3 md:space-x-6 w-48 justify-end">
        <div className="relative group">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsBlockSidebarOpen(true)}
            aria-label="Bloqueos"
          >
            <img src={lockIcon} alt="Bloqueos" style={{ width: '28px', height: '28px' }} />
          </button>
          <div className="absolute -bottom-8 right-0 w-24 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Bloqueos
          </div>
        </div>
        <div className="relative group">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={handleGoToRequests}
            aria-label="Solicitudes de reserva"
          >
            <img src={requestIcon} alt="Solicitudes de reserva" className="header-icon-mobile" style={{ width: '28px', height: '28px' }} />
          </button>
          <div className="absolute -bottom-8 right-0 w-36 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Solicitudes de reserva
          </div>
        </div>
        <div className="relative group">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={handleGoToWalkinPage}
            aria-label="Walk-in"
          >
            <img src={walkingIcon} alt="Walk-in" style={{ width: '28px', height: '28px' }} />
          </button>
          <div className="absolute -bottom-8 right-0 w-24 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Walk-in
          </div>
        </div>
        <div className="relative group">
          <button
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setIsNewReservationModalOpen(true)}
            aria-label="Nueva reserva"
          >
            <img src={reserveIcon} alt="Nueva reserva" style={{ width: '28px', height: '28px' }} />
          </button>
          <div className="absolute -bottom-8 right-0 w-28 bg-white text-gray-800 text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 px-2 text-center">
            Nueva reserva
          </div>
        </div>
      </div>

      {/* Modales y Sidebars */}
      <NewReservationModal
        isOpen={isNewReservationModalOpen}
        onClose={() => setIsNewReservationModalOpen(false)}
        onReservationCreate={(data) => {
          console.log('Nueva reserva creada:', data);
          setIsNewReservationModalOpen(false);
        }}
      />

      <BlockSidebar
        isOpen={isBlockSidebarOpen}
        onClose={() => setIsBlockSidebarOpen(false)}
        salones={salones}
        onBlockCreate={handleBlockCreate}
      />
    </div>
  );
};

export default Header;