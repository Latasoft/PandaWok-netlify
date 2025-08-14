import React, { useState } from 'react';

interface NuevaMesaModalProps {
  salones: { id: number; nombre: string }[];
  onClose: () => void;
  onAgregar: (mesaData: {
    salon_id: number;
    numero_mesa: string;
    tipo_mesa: string;
    tamanio: string;
    capacidad: number;
    esta_activa: boolean;
    posX: number;
    posY: number;
  }) => void;
}

const NuevaMesaModal: React.FC<NuevaMesaModalProps> = ({ salones, onClose, onAgregar }) => {
  const [salonId, setSalonId] = useState<number>(salones[0]?.id || 0);
  const [numeroMesa, setNumeroMesa] = useState('');
  const [tipoMesa, setTipoMesa] = useState<'redonda' | 'cuadrada' | 'rectangular'>('redonda');
  const [tamanioMesa, setTamanioMesa] = useState<'pequeña' | 'mediana' | 'grande'>('pequeña');
  const [capacidad, setCapacidad] = useState(4);

  const handleAgregar = () => {
    if (!numeroMesa.trim() || capacidad < 1) {
      alert('Completa todos los campos correctamente');
      return;
    }

    onAgregar({
      salon_id: salonId,
      numero_mesa: numeroMesa.trim(),
      tipo_mesa: tipoMesa,
      tamanio: tamanioMesa,
      capacidad,
      esta_activa: true, // siempre true al crear
      posX: 0,           // posición inicial fija, puedes cambiar si quieres
      posY: 0,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Agregar nueva mesa</h2>
          <button onClick={onClose} className="text-2xl leading-none font-bold">×</button>
        </div>

        <div className="p-6 space-y-4">
          {/* Selección de Salón */}
          <div>
            <label className="block font-semibold mb-1">Salón</label>
            <select
              value={salonId}
              onChange={e => setSalonId(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              {salones.map(salon => (
                <option key={salon.id} value={salon.id}>{salon.nombre}</option>
              ))}
            </select>
          </div>

          {/* Número de mesa */}
          <div>
            <label className="block font-semibold mb-1">Número de mesa</label>
            <input
              type="text"
              value={numeroMesa}
              onChange={e => setNumeroMesa(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: 12, A1, B7..."
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="block font-semibold mb-1">Capacidad</label>
            <input
              type="number"
              min={1}
              value={capacidad}
              onChange={e => setCapacidad(Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              placeholder="Ej: 4"
            />
          </div>

          {/* Tipo de mesa */}
          <div>
            <label className="block font-semibold mb-1">Forma de la mesa</label>
            <div className="flex gap-3">
              {['redonda', 'cuadrada', 'rectangular'].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setTipoMesa(tipo as any)}
                  className={`flex-1 px-3 py-2 border rounded ${
                    tipoMesa === tipo
                      ? 'bg-orange-100 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tamaño */}
          <div>
            <label className="block font-semibold mb-1">Tamaño de la mesa</label>
            <div className="flex gap-3">
              {['pequeña', 'mediana', 'grande'].map((tam) => (
                <button
                  key={tam}
                  onClick={() => setTamanioMesa(tam as any)}
                  className={`flex-1 px-3 py-2 border rounded ${
                    tamanioMesa === tam
                      ? 'bg-orange-100 border-orange-500'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {tam.charAt(0).toUpperCase() + tam.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded bg-white text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleAgregar}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Agregar mesa
          </button>
        </div>
      </div>
    </div>
  );
};

export default NuevaMesaModal;
