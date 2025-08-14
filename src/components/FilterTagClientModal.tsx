// src/components/FilterClientsModal.tsx
import React, { useState, useEffect } from 'react';

// Asegúrate de que esta interfaz esté correctamente definida en tu proyecto,
// o que coincida con la que tienes en FilterClientsModal.
export interface ClientFilters {
  minVisits?: number;
  maxVisits?: number;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  selectedTags: string[]; // <-- Esto es crucial para las tags
}

interface FilterClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ClientFilters) => void;
  currentFilters: ClientFilters; // Los filtros actualmente aplicados desde el padre
}

// Definición de todas las tags posibles, categorizadas
const allTagsByCategory = {
  'Preferencia de Asiento': [
    'Área de Fumadores', 'Área del Bar', 'Booth', 'Esquina', 'Fumador',
    'Interior', 'Mesa con Vista', 'Mesa Tranquila', 'Salón Principal', 'Terraza',
    'Ventana',
  ],
  'Restricciones de Dieta': [
    'Alergia', 'Huevos', 'Libre de Gluten', 'Libre de Lactosa', 'Mariscos',
    'Sin Maní', 'Vegano', 'Vegetariano',
  ],
  'Tipo de Cliente': [
    'Alto Consumo', 'Amigo de Empleado', 'Amigo del dueño', 'Blogger',
    'Buena Propina', 'Calificación Negativa', 'Calificación Positiva', 'Celebridad',
    'CEO', 'Cliente Frecuente', 'Cliente Regular', 'Concierge', 'Crítico',
    'Empleado', 'Foodie', 'Huésped', 'Influencer', 'Inversionista', 'Lista Negra',
    'No Show', 'Prensa', 'VIP',
  ],
  // Puedes añadir más categorías aquí si las tienes
};

const FilterClientsModal: React.FC<FilterClientsModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}) => {
  // Estado interno para manejar los filtros mientras el modal está abierto
  const [minVisits, setMinVisits] = useState<number | undefined>(currentFilters.minVisits);
  const [maxVisits, setMaxVisits] = useState<number | undefined>(currentFilters.maxVisits);
  const [minTotalSpent, setMinTotalSpent] = useState<number | undefined>(currentFilters.minTotalSpent);
  const [maxTotalSpent, setMaxTotalSpent] = useState<number | undefined>(currentFilters.maxTotalSpent);
  const [selectedTagsInternal, setSelectedTagsInternal] = useState<string[]>(currentFilters.selectedTags);

  // Sincronizar el estado interno del modal con los `currentFilters` que vienen del padre
  // Esto asegura que si el modal se reabre, refleje los filtros que ya están aplicados.
  useEffect(() => {
    setMinVisits(currentFilters.minVisits);
    setMaxVisits(currentFilters.maxVisits);
    setMinTotalSpent(currentFilters.minTotalSpent);
    setMaxTotalSpent(currentFilters.maxTotalSpent);
    setSelectedTagsInternal(currentFilters.selectedTags);
  }, [currentFilters]); // Dependencia: actualiza cuando currentFilters cambia

  // Función para alternar la selección de una tag
  const handleTagToggle = (tag: string) => {
    setSelectedTagsInternal(prevTags =>
      prevTags.includes(tag)
        ? prevTags.filter(t => t !== tag) // Deseleccionar
        : [...prevTags, tag] // Seleccionar
    );
  };

  // Función que se llama al presionar "Confirmar"
  const handleConfirm = () => {
    onApplyFilters({
      minVisits,
      maxVisits,
      minTotalSpent,
      maxTotalSpent,
      selectedTags: selectedTagsInternal, // Pasar las tags seleccionadas
    });
    onClose(); // Cerrar el modal después de aplicar los filtros
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-[#211B17] p-6 rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto text-white">
        <h2 className="text-xl font-semibold mb-4 text-[#F2994A]">Filtros de Clientes</h2>

        {/* SECCIÓN DE FILTROS NUMÉRICOS (OPCIONAL: si quieres mantenerlos) */}
        <div className="mb-6 border-b border-gray-700 pb-4"> {/* Separador visual */}
          <h3 className="text-lg font-medium mb-3">Estadísticas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="minVisits" className="block text-gray-300 text-sm font-bold mb-1">Visitas Mínimas:</label>
              <input
                type="number"
                id="minVisits"
                value={minVisits === undefined ? '' : minVisits}
                onChange={(e) => setMinVisits(e.target.value === '' ? undefined : Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="maxVisits" className="block text-gray-300 text-sm font-bold mb-1">Visitas Máximas:</label>
              <input
                type="number"
                id="maxVisits"
                value={maxVisits === undefined ? '' : maxVisits}
                onChange={(e) => setMaxVisits(e.target.value === '' ? undefined : Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="minTotalSpent" className="block text-gray-300 text-sm font-bold mb-1">Gasto Total Mínimo:</label>
              <input
                type="number"
                id="minTotalSpent"
                value={minTotalSpent === undefined ? '' : minTotalSpent}
                onChange={(e) => setMinTotalSpent(e.target.value === '' ? undefined : Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label htmlFor="maxTotalSpent" className="block text-gray-300 text-sm font-bold mb-1">Gasto Total Máximo:</label>
              <input
                type="number"
                id="maxTotalSpent"
                value={maxTotalSpent === undefined ? '' : maxTotalSpent}
                onChange={(e) => setMaxTotalSpent(e.target.value === '' ? undefined : Number(e.target.value))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
        </div>

        {/* SECCIONES DE TAGS DINÁMICAS BASADAS EN allTagsByCategory */}
        {Object.entries(allTagsByCategory).map(([category, tags]) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium mb-3">{category}</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  // Clases condicionales para resaltar la tag seleccionada
                  className={`px-4 py-2 rounded-md border text-sm ${
                    selectedTagsInternal.includes(tag)
                      ? 'bg-[#F2994A] border-[#F2994A] text-white' // Estilo para seleccionado
                      : 'border-gray-600 text-gray-300 hover:bg-gray-700' // Estilo para no seleccionado
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-md border border-gray-600 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-[#F2994A] text-white rounded-md hover:bg-[#d97d23] transition-colors font-semibold"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterClientsModal;