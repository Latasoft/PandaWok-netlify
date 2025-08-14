import React from 'react';

interface ClientTagsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTags: string[];
  onTagsUpdate: (tags: string[]) => void;
}

const ClientTagsModal: React.FC<ClientTagsModalProps> = ({
  isOpen,
  onClose,
  selectedTags,
  onTagsUpdate
}) => {
  if (!isOpen) return null;

  const tagCategories = [
    {
      title: 'Preferencia de Asiento',
      tags: ['Area de fumadores', 'Esquina', 'Mesa con Vista', 'Mesa Tranquila', 'Salon principal'],
      color: 'blue'
    },
    {
      title: 'Restricciones de Dieta',
      tags: ['Alergia', 'Huevos', 'Libre de gluten', 'Libre de lactosa', 'Mariscos', 'Sin maní', 'Vegano', 'Vegetariano'],
      color: 'green'
    },
    {
      title: 'Tipo de cliente',
      tags: ['Alto consumo', 'Amigo de empleado', 'Amigo del dueño', 'Blogger', 'Celebridad', 'CEO', 'Cliente frecuente', 'Critico', 'Empleado', 'Inversionista', 'Lista negra', 'No Show', 'Prensa'],
      color: 'purple'
    },
    
  ];

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsUpdate(selectedTags.filter(t => t !== tag));
    } else {
      onTagsUpdate([...selectedTags, tag]);
    }
  };

  const getTagStyle = (tag: string, color: string) => {
    const isSelected = selectedTags.includes(tag);

    const colorClasses = {
      blue: isSelected ? 'bg-blue-200 text-blue-800 border-blue-300 hover:bg-blue-300' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100',
      green: isSelected ? 'bg-green-200 text-green-800 border-green-300 hover:bg-green-300' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100',
      purple: isSelected ? 'bg-purple-200 text-purple-800 border-purple-300 hover:bg-purple-300' : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100',
      orange: isSelected ? 'bg-orange-200 text-orange-800 border-orange-300 hover:bg-orange-300' : 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100'
    };

    return `${colorClasses[color as keyof typeof colorClasses]} px-2 py-1 sm:px-3 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors cursor-pointer shadow-sm`;
  };

  return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                  <div className="flex items-center justify-between p-3 sm:p-5 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tags de cliente</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-5 overflow-y-auto flex-1">
          <div className="space-y-6">
            {tagCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="text-md font-semibold text-gray-800">{category.title}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={getTagStyle(tag, category.color)}
                    >
                      {tag}
                      {selectedTags.includes(tag) && (
                        <span className="ml-1 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-3 mt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-1 items-center">
                <span className="text-sm text-gray-700 mr-2">Tags seleccionados:</span>
                {selectedTags.length > 0 ? (
                  selectedTags.map((tag) => {
                    // Buscar en qué categoría se encuentra el tag
                    let tagCategory = tagCategories.find(category => 
                      category.tags.includes(tag)
                    );

                    const color = tagCategory ? tagCategory.color : 'orange';
                    const colorClasses: {[key: string]: string} = {
                      blue: 'bg-blue-100 text-blue-800 border-blue-300',
                      green: 'bg-green-100 text-green-800 border-green-300',
                      purple: 'bg-purple-100 text-purple-800 border-purple-300',
                      orange: 'bg-orange-100 text-orange-800 border-orange-300'
                    };

                    return (
                      <div key={tag} className={`${colorClasses[color]} border px-2 py-1 rounded-full text-xs flex items-center`}>
                        {tag}
                        <button
                          onClick={() => handleTagClick(tag)}
                          className="ml-1 hover:opacity-80"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500 italic">Ninguno seleccionado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-3 sm:p-5 flex justify-end space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 rounded-lg text-white text-sm sm:text-base font-medium hover:bg-orange-600 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientTagsModal;
