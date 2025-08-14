import React, { useState, useEffect } from 'react';

interface EditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  currentNote?: string;
}

const EditNoteModal: React.FC<EditNoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentNote = ''
}) => {
  const [note, setNote] = useState(currentNote);

  useEffect(() => {
    if (isOpen) {
      setNote(currentNote);
    }
  }, [currentNote, isOpen]);

  const handleSave = () => {
    onSave(note);
    onClose();
  };

  const handleCancel = () => {
    setNote(currentNote);
    onClose();
  };

  if (!isOpen) return null;

  return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full sm:w-96 max-w-md">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nueva nota</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-800"
          />
        </div>

        <div className="flex items-center justify-end space-x-2 sm:space-x-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 sm:px-4 sm:py-2 text-gray-700 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm sm:text-base rounded-lg transition-colors font-medium"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
