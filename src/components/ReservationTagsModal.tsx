import React, { useState, useEffect } from 'react';

interface ReservationTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTags: (tags: string[]) => void;
  initialSelectedTags: string[];
}

const ReservationTagsModal: React.FC<ReservationTagsModalProps> = ({ isOpen, onClose, onSaveTags, initialSelectedTags }) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(initialSelectedTags);

  // Sincronizar el estado interno con las props iniciales cuando el modal se abre
  useEffect(() => {
    setSelectedTags(initialSelectedTags);
  }, [initialSelectedTags, isOpen]); // Asegúrate de que se actualice si isOpen cambia o initialSelectedTags cambia fuera

  const toggleTag = (tag: string) => {
    setSelectedTags(prevTags => {
      if (prevTags.includes(tag)) {
        return prevTags.filter(t => t !== tag);
      } else {
        return [...prevTags, tag];
      }
    });
  };

  const handleSave = () => {
    onSaveTags(selectedTags);
    // El onClose ya se maneja en NewRequestModal después de onSaveTags
  };

  if (!isOpen) return null;

  // Definición de los tags para el modal de reserva, basados en tus imágenes
  const categories = {
    'Atención Especial': [
      'Acceso en silla de ruedas', 'Alerta para el chef', 'Alerta para el gerente',
      'Cuenta de la Casa', 'Cuentas Separadas', 'Menú para niños',
      'No mover mesa', 'Primera Vez', 'Silla para bebé'
    ],
    'Ocasiones Especiales': [
      'Aniversario', 'Celebración de Negocios', 'Compromiso',
      'Cumpleaños', 'Evento Especial', 'Graduación'
    ],
    'Restricciones de Dieta': [ // Aunque se repiten, aquí son tags de reserva
      'Huevos', 'Libre de lactosa', 'Maní', 'Mariscos',
      // Agrega otros si los necesitas aquí para la reserva
    ],
    'Solicitud de Mesa': [
      'Área de Fumadores', 'Mesa tranquila', 'Rooftop', 'Salón',
      'Salón Principal', 'Solicitud de Área del Bar', 'Solicitud de Booth',
      'Solicitud de Esquina', 'Solicitud de patio', 'Solicitud de ventana',
      'Solicitud de vista', 'Solicitud Interior', 'Terraza'
    ],
    'Otros': [
      'Abono', 'Abono 50%', 'BurguerWeek', 'Campaña',
      'Consumo avisado', 'Degusta', 'Oferta Simple', 'Página Web',
      'Redes Sociales', 'Tripadvisor', 'Valor abono'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212133] rounded-lg shadow-xl w-full max-w-lg md:max-w-xl h-[90vh] overflow-y-auto flex flex-col">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-4 border-b border-[#3C2022] sticky top-0 bg-[#212133] z-10">
          <h2 className="text-xl font-semibold text-white">Tags de Reserva</h2>
          <button onClick={onClose} className="text-white hover:text-gray-400 p-1" aria-label="Cerrar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal - Categorías de tags */}
        <div className="p-6 flex-1 space-y-6"
             style={{ scrollbarWidth: 'thin', scrollbarColor: '#B24E00 #212133' }}>
          {Object.entries(categories).map(([categoryName, tags]) => (
            <div key={categoryName}>
              <h3 className="text-lg text-white font-medium mb-3">{categoryName}</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-colors
                      ${selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white border border-blue-600' // Color para seleccionado
                        : 'bg-transparent text-gray-300 border border-gray-600 hover:bg-gray-700'
                      }
                      ${categoryName === 'Atención Especial' ? 'border-orange-500' : ''}
                      ${categoryName === 'Ocasiones Especiales' ? 'border-pink-500' : ''}
                      ${categoryName === 'Restricciones de Dieta' ? 'border-green-500' : ''}
                      ${categoryName === 'Solicitud de Mesa' ? 'border-purple-500' : ''}
                      ${categoryName === 'Otros' ? 'border-red-500' : ''}
                    `}
                    style={{
                      borderColor: selectedTags.includes(tag) ? '' : // Solo aplica el color del borde si no está seleccionado
                         categoryName === 'Atención Especial' ? '#F97316' :
                         categoryName === 'Ocasiones Especiales' ? '#EC4899' :
                         categoryName === 'Restricciones de Dieta' ? '#22C55E' :
                         categoryName === 'Solicitud de Mesa' ? '#A855F7' :
                         categoryName === 'Otros' ? '#EF4444' : '', // Ajusta los colores según tu diseño
                      color: selectedTags.includes(tag) ? 'white' :
                         categoryName === 'Atención Especial' ? '#F97316' :
                         categoryName === 'Ocasiones Especiales' ? '#EC4899' :
                         categoryName === 'Restricciones de Dieta' ? '#22C55E' :
                         categoryName === 'Solicitud de Mesa' ? '#A855F7' :
                         categoryName === 'Otros' ? '#EF4444' : ''
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer del modal - Botón Guardar */}
        <div className="p-4 border-t border-[#3C2022] flex justify-end sticky bottom-0 bg-[#212133] z-10">
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationTagsModal;