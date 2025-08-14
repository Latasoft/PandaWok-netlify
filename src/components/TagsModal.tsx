// src/components/TagsModal.tsx
import React, { useState, useEffect, type MouseEvent } from 'react';
import axios from 'axios';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTags: (tags: string[]) => void;
  currentSelectedTags: string[];
}

// Tipo para la categoría "Cliente", que tiene subcategorías con listas de tags
type ClienteCategory = Record<string, string[]>;

const TagsModal: React.FC<TagsModalProps> = ({
  isOpen,
  onClose,
  onApplyTags,
  currentSelectedTags,
}) => {
  const [selectedTagsInternal, setSelectedTagsInternal] = useState<string[]>(currentSelectedTags);
  const [clienteCategory, setClienteCategory] = useState<ClienteCategory>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    setSelectedTagsInternal(currentSelectedTags);
  }, [currentSelectedTags]);

  useEffect(() => {
    if (isOpen) {
      fetchClienteCategory();
    }
  }, [isOpen]);

  const fetchClienteCategory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<Record<string, ClienteCategory>>('/api/tags/categorias');
      // Extraemos solo la categoría "Cliente"
      const clienteData = res.data['Cliente'] || {};
      setClienteCategory(clienteData);
    } catch {
      setError('Error al cargar las tags de la categoría Cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTagsInternal(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleApply = () => {
    onApplyTags(selectedTagsInternal);
    onClose();
  };

  const handleReset = () => {
    setSelectedTagsInternal([]);
    onApplyTags([]);
  };

  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const numberOfSelectedTags = selectedTagsInternal.length;

  if (!isOpen) return null;

  return (
    <div
      className="absolute top-0 right-0 h-full z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white text-[#211B17] w-[360px] h-full shadow-lg flex flex-col transform transition-transform duration-300 ease-out translate-x-0 border-l border-gray-200">
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#211B17]">Tags - Categoría Cliente</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-[#F2994A] text-sm transition-colors duration-200"
            >
              Restablecer
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-[#F2994A] transition-colors duration-200 focus:outline-none"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido principal del modal - Mostrar todas las subcategorías de "Cliente" */}
        <div className="flex-1 p-4 overflow-y-auto">
          {loading && (
            <p className="text-center text-gray-500">Cargando tags...</p>
          )}
          {error && (
            <p className="text-center text-red-600">{error}</p>
          )}
          {!loading && !error && Object.keys(clienteCategory).length === 0 && (
            <p className="text-center text-gray-500 select-none">No hay tags en la categoría Cliente.</p>
          )}

          {!loading && !error && (
            <>
              {Object.entries(clienteCategory).map(([subcategoria, tags]) => (
                <div key={subcategoria} className="mb-6">
                  <h3 className="text-lg font-medium text-[#211B17] mb-3">{subcategoria}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 && (
                      <p className="text-gray-500 select-none">No hay tags en esta subcategoría.</p>
                    )}
                    {tags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`
                          px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap
                          ${selectedTagsInternal.includes(tag)
                            ? 'bg-[#F2994A] border-[#F2994A] text-white shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                          }
                          transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-[#F2994A]
                        `}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pie de página con botón Aplicar */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={handleApply}
            className="w-full px-6 py-3 bg-[#F2994A] text-white rounded-md hover:bg-[#d97d23] transition-colors duration-200 font-semibold text-lg shadow-md"
          >
            Aplicar ({numberOfSelectedTags})
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagsModal;
