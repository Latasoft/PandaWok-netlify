import React, { useState, useEffect } from 'react';

interface Salon {
  id: string;
  name: string;
  tables: any[];
}

interface BlockSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  salones: Salon[];
  onBlockCreate: (blockData: any) => void;
}

const BlockSidebar: React.FC<BlockSidebarProps> = ({ isOpen, onClose, salones, onBlockCreate }) => {
  const [blockDate, setBlockDate] = useState<Date>(new Date());
  const [allDay, setAllDay] = useState<boolean>(true);
  const [timeFrom, setTimeFrom] = useState<string>('');
  const [timeTo, setTimeTo] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('Todas las Áreas');
  const [applyTo, setApplyTo] = useState<'all' | 'min_persons' | 'max_persons'>('all');
  const [personsCount, setPersonsCount] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) {
      setBlockDate(new Date());
      setAllDay(true);
      setTimeFrom('');
      setTimeTo('');
      setSelectedArea('Todas las Áreas');
      setApplyTo('all');
      setPersonsCount(0);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return `Hoy, ${date.getDate()} ${months[date.getMonth()]}`;
    }
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const handleCreateBlock = () => {
    const blockData = {
      date: blockDate.toISOString().split('T')[0],
      allDay: allDay,
      timeFrom: allDay ? null : timeFrom,
      timeTo: allDay ? null : timeTo,
      area: selectedArea,
      applyTo: applyTo,
      personsCount: (applyTo !== 'all') ? personsCount : null,
    };
    onBlockCreate(blockData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#FFF8E1]/60 backdrop-blur-sm">
      <div className="w-full md:w-96 h-full bg-white border-l border-orange-200 shadow-xl p-6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#3C2022]">Bloqueos</h2>
          <button onClick={onClose} className="text-[#3C2022] hover:text-orange-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <h3 className="text-lg text-[#3C2022] font-semibold mb-4">Crear nuevo bloqueo</h3>

          {/* Fecha */}
          <div className="mb-4">
            <label className="block text-sm text-[#3C2022] mb-1">Fecha</label>
            <input
              type="text"
              value={formatDate(blockDate)}
              readOnly
              className="w-full p-2 rounded bg-[#FFF8E1] text-[#3C2022] border border-orange-200"
            />
          </div>

          {/* Todo el día */}
          <div className="flex items-center mb-4">
            <label htmlFor="allDayToggle" className="mr-3 text-sm text-[#3C2022]">Todo el día</label>
            <input
              type="checkbox"
              id="allDayToggle"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="sr-only peer"
            />
            <div
              className="relative w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-orange-500 transition-colors cursor-pointer"
              onClick={() => setAllDay(!allDay)}
            >
              <div className="absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition-transform peer-checked:translate-x-full"></div>
            </div>
          </div>

          {/* Horario */}
          {!allDay && (
            <div className="flex space-x-4 mb-4">
              <div className="w-1/2">
                <label className="block text-sm text-[#3C2022] mb-1">Desde</label>
                <input
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                  className="w-full p-2 rounded bg-[#FFF8E1] border border-orange-200 text-[#3C2022]"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-sm text-[#3C2022] mb-1">Hasta</label>
                <input
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                  className="w-full p-2 rounded bg-[#FFF8E1] border border-orange-200 text-[#3C2022]"
                />
              </div>
            </div>
          )}

          {/* Área */}
          <div className="mb-4">
            <label className="block text-sm text-[#3C2022] mb-1">Área</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 rounded bg-[#FFF8E1] border border-orange-200 text-[#3C2022]"
            >
              <option value="Todas las Áreas">Todas las Áreas</option>
              {salones.map((salon) => (
                <option key={salon.id} value={salon.name}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>

          {/* Aplicar a */}
          <div className="mb-6">
            <label className="block text-sm text-[#3C2022] mb-2">Aplicar a:</label>
            <div className="space-y-2">
              <label className="flex items-center text-sm text-[#3C2022]">
                <input
                  type="radio"
                  name="applyTo"
                  value="all"
                  checked={applyTo === 'all'}
                  onChange={() => setApplyTo('all')}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                Todas las reservas
              </label>
              <label className="flex items-center text-sm text-[#3C2022]">
                <input
                  type="radio"
                  name="applyTo"
                  value="min_persons"
                  checked={applyTo === 'min_persons'}
                  onChange={() => setApplyTo('min_persons')}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                Reservas de
                <input
                  type="number"
                  value={personsCount}
                  onChange={(e) => setPersonsCount(parseInt(e.target.value) || 0)}
                  disabled={applyTo !== 'min_persons'}
                  className={`ml-2 w-16 p-1 rounded border text-center ${
                    applyTo !== 'min_persons' ? 'opacity-50 bg-gray-100' : 'bg-[#FFF8E1]'
                  }`}
                />
                o más personas
              </label>
              <label className="flex items-center text-sm text-[#3C2022]">
                <input
                  type="radio"
                  name="applyTo"
                  value="max_persons"
                  checked={applyTo === 'max_persons'}
                  onChange={() => setApplyTo('max_persons')}
                  className="mr-2 text-orange-500 focus:ring-orange-500"
                />
                Reservas de
                <input
                  type="number"
                  value={personsCount}
                  onChange={(e) => setPersonsCount(parseInt(e.target.value) || 0)}
                  disabled={applyTo !== 'max_persons'}
                  className={`ml-2 w-16 p-1 rounded border text-center ${
                    applyTo !== 'max_persons' ? 'opacity-50 bg-gray-100' : 'bg-[#FFF8E1]'
                  }`}
                />
                o menos personas
              </label>
            </div>
          </div>

          <button
            onClick={handleCreateBlock}
            className="w-full bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition-colors"
          >
            Crear Bloqueo
          </button>
        </div>

        <div className="mt-auto text-center text-sm text-gray-500">
          Bloqueos Creados para hoy (0)
        </div>
      </div>
    </div>
  );
};

export default BlockSidebar;
