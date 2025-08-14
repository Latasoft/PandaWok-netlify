// src/components/ChangeTableModal.tsx
import React, { useState } from 'react';

interface ChangeTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmChange: (fromTableId: number, toTableId: number) => void;
  currentTableId: number | null;
  availableTables: { id: number; salonName: string }[]; // Mesas disponibles para mover
}

const ChangeTableModal: React.FC<ChangeTableModalProps> = ({ isOpen, onClose, onConfirmChange, currentTableId, availableTables }) => {
  const [newTableId, setNewTableId] = useState<number | ''>('');

  if (!isOpen || currentTableId === null) return null;

  const handleConfirm = () => {
    if (newTableId !== '' && currentTableId !== newTableId) {
      onConfirmChange(currentTableId, newTableId as number);
      onClose();
    } else {
      alert('Por favor, selecciona una mesa diferente para mover.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Cambiar Mesa (Walk-in)</h2>
        <p className="text-gray-700 mb-4">Mover walk-in de la Mesa {currentTableId} a:</p>

        <div className="mb-6">
          <label htmlFor="newTable" className="block text-gray-700 text-sm font-semibold mb-2">Seleccionar Nueva Mesa:</label>
          <select
            id="newTable"
            value={newTableId}
            onChange={(e) => setNewTableId(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-800"
          >
            <option value="" disabled>Selecciona una mesa</option>
            {availableTables.map((table) => (
              <option key={table.id} value={table.id}>
                Mesa {table.id} ({table.salonName})
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Confirmar Cambio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeTableModal;