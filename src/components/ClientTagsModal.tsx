// src/components/ClientTagsModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ClientTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTags: (tags: string[]) => void;
  initialSelectedTags: string[];
}

// El tipo que esperamos recibir de la API
interface TagsByCategory {
  [categoria: string]: {
    [subcategoria: string]: string[];
  };
}

const ClientTagsModal: React.FC<ClientTagsModalProps> = ({ isOpen, onClose, onSaveTags, initialSelectedTags }) => {
  const [tagsByCategory, setTagsByCategory] = useState<TagsByCategory>({});
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
      setSelectedTags(initialSelectedTags);
    }
  }, [isOpen, initialSelectedTags]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<TagsByCategory>('/api/tags/categorias');
      setTagsByCategory(res.data);
    } catch {
      setError('Error al cargar los tags');
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleConfirm = () => {
    onSaveTags(selectedTags);
    onClose();
  };

  // Función para cerrar el modal al hacer click fuera de la caja (overlay)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Puedes modificar colores según categoría o subcategoría
  const getTagColors = (tag: string, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-red-600 border-red-600 text-white';
    } else {
      return 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-400 transition-colors';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#211B17] rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#655644] flex justify-between items-center">
          <button onClick={onClose} className="text-[#F7F7ED] hover:text-white" aria-label="Cerrar modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-[#F7F7ED]">Tags de Cliente</h2>
          <button onClick={handleConfirm} className="text-[#F2994A] hover:text-white" aria-label="Confirmar selección">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {/* Contenido - manejo loading y error */}
        <div className="p-4 flex-grow overflow-y-auto custom-scrollbar">
          {loading && <p className="text-center text-gray-400">Cargando tags...</p>}
          {error && <p className="text-center text-red-600">{error}</p>}

          {!loading && !error && Object.entries(tagsByCategory).length === 0 && (
            <p className="text-center text-gray-400">No hay tags disponibles.</p>
          )}

          {!loading && !error && Object.entries(tagsByCategory).map(([categoria, subcategorias]) => (
            <div key={categoria} className="mb-6">
              <h3 className="text-lg font-medium text-[#F7F7ED] mb-3">{categoria}</h3>

              {Object.entries(subcategorias).map(([subcategoria, tags]) => (
                <div key={subcategoria} className="mb-4">
                  <h4 className="text-md font-semibold text-gray-300 mb-2">{subcategoria}</h4>
                  <div className="flex flex-wrap gap-3">
                    {tags.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          className={`px-4 py-2 rounded-full border text-sm select-none ${getTagColors(tag, isSelected)}`}
                          onClick={() => handleTagClick(tag)}
                          type="button"
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#655644] flex justify-between gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-md border border-[#655644] text-[#F7F7ED] hover:bg-[#655644] hover:border-[#F2994A] transition-colors font-semibold"
            type="button"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 bg-[#F2994A] text-white rounded-md hover:bg-[#d97d23] transition-colors font-semibold"
            type="button"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientTagsModal;
