import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Mesa {
  id: number;
  salon_id: number;
  numero_mesa: string;
  tipo_mesa: string;
  tamanio: string;
  capacidad: number;
  esta_activa: boolean;
  posX?: number;
  posY?: number;
}

interface Salon {
  id: number;
  nombre: string;
  capacidad: number;
  es_condicion_especial: boolean;
}

interface EditMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mesa: Mesa;
  salones: Salon[];
  onEdit: (mesaData: Partial<Mesa>) => Promise<void>;
}

const EditMesaModal: React.FC<EditMesaModalProps> = ({
  isOpen,
  onClose,
  mesa,
  salones,
  onEdit,
}) => {
  const [formData, setFormData] = useState({
    salon_id: mesa.salon_id,
    numero_mesa: mesa.numero_mesa,
    tipo_mesa: mesa.tipo_mesa,
    tamanio: mesa.tamanio,
    capacidad: mesa.capacidad,
    esta_activa: mesa.esta_activa,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Función para obtener los límites de capacidad según el tamaño
  const getCapacityLimits = (tamanio: string) => {
    const limits: { [key: string]: { min: number; max: number } } = {
      'pequeña': { min: 1, max: 4 },
      'Pequeña': { min: 1, max: 4 },
      'pequeña mesa': { min: 1, max: 4 },
      'mediana': { min: 3, max: 6 },
      'Mediana': { min: 3, max: 6 },
      'mediana mesa': { min: 3, max: 6 },
      'grande': { min: 5, max: 10 },
      'Grande': { min: 5, max: 10 },
      'grande mesa': { min: 5, max: 10 },
    };
    
    return limits[tamanio] || { min: 1, max: 10 };
  };

  // Función para validar capacidad según tipo y tamaño
  const validateCapacity = (tipo: string, tamanio: string, capacidad: number): string | null => {
    const limits = getCapacityLimits(tamanio);
    
    if (capacidad < limits.min || capacidad > limits.max) {
      return `Para una mesa ${tipo.toLowerCase()} ${tamanio.toLowerCase()}, la capacidad debe estar entre ${limits.min} y ${limits.max} personas.`;
    }
    
    return null;
  };

  useEffect(() => {
    if (isOpen && mesa) {
      console.log('🔍 [EDIT MESA DEBUG] Mesa seleccionada:', {
        id: mesa.id,
        numero_mesa: mesa.numero_mesa,
        tipo_mesa: mesa.tipo_mesa,
        tamanio: mesa.tamanio,
        capacidad: mesa.capacidad,
        esta_activa: mesa.esta_activa,
        salon_id: mesa.salon_id
      });
      
      setFormData({
        salon_id: mesa.salon_id,
        numero_mesa: mesa.numero_mesa,
        tipo_mesa: mesa.tipo_mesa || '',
        tamanio: mesa.tamanio || '',
        capacidad: mesa.capacidad,
        esta_activa: mesa.esta_activa,
      });
      setError('');
    }
  }, [isOpen, mesa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.numero_mesa.trim()) {
      setError('El número de mesa es obligatorio');
      return;
    }

    if (!formData.tipo_mesa.trim()) {
      setError('El tipo de mesa es obligatorio');
      return;
    }

    if (!formData.tamanio.trim()) {
      setError('El tamaño es obligatorio');
      return;
    }

    if (formData.capacidad <= 0) {
      setError('La capacidad debe ser mayor a 0');
      return;
    }

    // Validar capacidad según tipo y tamaño
    const capacityError = validateCapacity(formData.tipo_mesa, formData.tamanio, formData.capacidad);
    if (capacityError) {
      setError(capacityError);
      return;
    }

    try {
      setIsSubmitting(true);
      await onEdit({
        id: mesa.id,
        ...formData,
      });
      onClose();
    } catch (error: any) {
      console.error('Error editando mesa:', error);
      
      // Mostrar mensaje específico de error si viene del servidor
      let errorMessage = 'Error al editar la mesa. Intenta nuevamente.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Editar Mesa {mesa.numero_mesa}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Salón */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salón
            </label>
            <select
              value={formData.salon_id}
              onChange={(e) =>
                setFormData({ ...formData, salon_id: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              {salones.map((salon) => (
                <option key={salon.id} value={salon.id}>
                  {salon.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Número de Mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Mesa
            </label>
            <input
              type="text"
              value={formData.numero_mesa}
              onChange={(e) =>
                setFormData({ ...formData, numero_mesa: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ej: A1, B2, 101"
              required
            />
          </div>

          {/* Tipo de Mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Mesa
            </label>
            <select
              value={formData.tipo_mesa}
              onChange={(e) => {
                const newTipo = e.target.value;
                setFormData({ ...formData, tipo_mesa: newTipo });
                
                // Validar capacidad con el nuevo tipo
                if (newTipo && formData.tamanio && formData.capacidad > 0) {
                  const capacityError = validateCapacity(newTipo, formData.tamanio, formData.capacidad);
                  if (capacityError) {
                    setError(capacityError);
                  } else {
                    setError('');
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="redonda">Redonda</option>
              <option value="cuadrada">Cuadrada</option>
              <option value="rectangula">Rectangular</option>
              <option value="alta">Alta</option>
              <option value="booth">Booth</option>
            </select>
            {formData.tipo_mesa && (
              <p className="text-xs text-gray-500 mt-1">Valor actual: "{formData.tipo_mesa}"</p>
            )}
          </div>

          {/* Tamaño */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tamaño
            </label>
            <select
              value={formData.tamanio}
              onChange={(e) => {
                const newTamanio = e.target.value;
                setFormData({ ...formData, tamanio: newTamanio });
                
                // Validar capacidad con el nuevo tamaño
                if (formData.tipo_mesa && newTamanio && formData.capacidad > 0) {
                  const capacityError = validateCapacity(formData.tipo_mesa, newTamanio, formData.capacidad);
                  if (capacityError) {
                    setError(capacityError);
                  } else {
                    setError('');
                  }
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              required
            >
              <option value="">Seleccionar tamaño</option>
              <option value="pequeña">Pequeña</option>
              <option value="mediana">Mediana</option>
              <option value="grande">Grande</option>
            </select>
            {formData.tamanio && (
              <p className="text-xs text-gray-500 mt-1">Valor actual: "{formData.tamanio}"</p>
            )}
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacidad
            </label>
            <input
              type="number"
              value={formData.capacidad}
              onChange={(e) => {
                const newCapacity = parseInt(e.target.value) || 0;
                setFormData({ ...formData, capacidad: newCapacity });
                
                // Limpiar error si la capacidad es válida
                if (formData.tipo_mesa && formData.tamanio && newCapacity > 0) {
                  const capacityError = validateCapacity(formData.tipo_mesa, formData.tamanio, newCapacity);
                  if (capacityError) {
                    setError(capacityError);
                  } else {
                    setError('');
                  }
                }
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                formData.tipo_mesa && formData.tamanio && validateCapacity(formData.tipo_mesa, formData.tamanio, formData.capacidad)
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              min={formData.tamanio ? getCapacityLimits(formData.tamanio).min : 1}
              max={formData.tamanio ? getCapacityLimits(formData.tamanio).max : 20}
              required
            />
            {formData.tamanio && (
              <p className="text-xs text-green-600 mt-1">
                ✅ Capacidad permitida para mesa {formData.tamanio.toLowerCase()}: {getCapacityLimits(formData.tamanio).min}-{getCapacityLimits(formData.tamanio).max} personas
              </p>
            )}
            {formData.tipo_mesa && formData.tamanio && validateCapacity(formData.tipo_mesa, formData.tamanio, formData.capacidad) && (
              <p className="text-xs text-red-600 mt-1">
                ❌ {validateCapacity(formData.tipo_mesa, formData.tamanio, formData.capacidad)}
              </p>
            )}
          </div>

          {/* Estado Activo */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="esta_activa"
              checked={formData.esta_activa}
              onChange={(e) =>
                setFormData({ ...formData, esta_activa: e.target.checked })
              }
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="esta_activa" className="text-sm font-medium text-gray-700">
              Mesa activa (disponible para reservas)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditMesaModal;