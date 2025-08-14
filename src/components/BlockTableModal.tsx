import React, { useState, useEffect } from 'react';

interface BlockTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBlock: (tableId: number, startTime: string, endTime: string, date: string) => void;
  tableId: number | null;
  currentSalonName: string;
  generateTimeOptions: () => string[];
  fechaSeleccionada?: string;
}

const BlockTableModal: React.FC<BlockTableModalProps> = ({
  isOpen,
  onClose,
  onBlock,
  tableId,
  currentSalonName,
  generateTimeOptions,
}) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [blockDate, setBlockDate] = useState('');

  const roundMinutes = (date: Date) => {
    const minutes = date.getMinutes();
    return minutes < 30 ? 0 : 30;
  };

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      now.setMinutes(roundMinutes(now));
      now.setSeconds(0);
      now.setMilliseconds(0);

      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const formattedStartTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      const endDate = new Date(now.getTime() + 30 * 60000);
      const formattedEndTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

      const formattedDate = now.toISOString().split('T')[0];

      setStartTime(formattedStartTime);
      setEndTime(formattedEndTime);
      setBlockDate(formattedDate);
    } else {
      setStartTime('');
      setEndTime('');
      setBlockDate('');
    }
  }, [isOpen]);

  const handleBlockConfirm = () => {
    if (tableId === null) {
      alert('Mesa no seleccionada');
      return;
    }
    if (!startTime || !endTime || !blockDate) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    const today = new Date();
    const selectedDate = new Date(blockDate);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert('La fecha no puede ser anterior a hoy.');
      return;
    }

    if (startTime >= endTime) {
      alert('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }

    onBlock(tableId, startTime, endTime, blockDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blockTableModalTitle"
      className="fixed inset-0 bg-[#FFF8E1]/80 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-orange-200">
        <h2 id="blockTableModalTitle" className="text-xl font-bold mb-4 text-[#3C2022]">
          Bloquear Mesa {tableId} en {currentSalonName}
        </h2>

        {/* Fecha */}
        <div className="mb-4">
          <label htmlFor="blockDate" className="block font-semibold text-sm text-[#3C2022] mb-1">
            Fecha:
          </label>
          <input
            id="blockDate"
            type="date"
            value={blockDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setBlockDate(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Hora inicio */}
        <div className="mb-4">
          <label htmlFor="startTime" className="block font-semibold text-sm text-[#3C2022] mb-1">
            Hora de inicio:
          </label>
          <select
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {generateTimeOptions().map((time) => (
              <option key={`start-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        {/* Hora fin */}
        <div className="mb-6">
          <label htmlFor="endTime" className="block font-semibold text-sm text-[#3C2022] mb-1">
            Hora de fin:
          </label>
          <select
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {generateTimeOptions().map((time) => (
              <option key={`end-${time}`} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleBlockConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            type="button"
          >
            Confirmar Bloqueo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockTableModal;
