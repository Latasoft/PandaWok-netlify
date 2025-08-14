import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const HORAS = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
  '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function MarketingModal({ onClose, onSave }: any) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagen, setImagen] = useState<File | null>(null);
  const [activa, setActiva] = useState(true);
  const [monto, setMonto] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [salonesDisponibles, setSalonesDisponibles] = useState<any[]>([]);
  const [salonesSeleccionados, setSalonesSeleccionados] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-ajustar altura del textarea según contenido
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // resetear altura
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; // autoajustar
    }
  }, [descripcion]);

  // Cargar salones desde API con axios y API_BASE_URL
  useEffect(() => {
    const fetchSalones = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/salones`);
        const salonesData = res.data.salones || res.data;
        setSalonesDisponibles(salonesData);
      } catch (error) {
        console.error('Error cargando salones:', error);
      }
    };
    fetchSalones();
  }, []);

  const guardar = () => {
    const horario = `${desde} - ${hasta}`;
    onSave({
      titulo,
      descripcion,
      imagen,
      activa,
      monto,
      horario,
      capacidad,
      salones: salonesSeleccionados,
    });
  };

  const toggleSalon = (id: string) => {
    if (salonesSeleccionados.includes(id)) {
      setSalonesSeleccionados(salonesSeleccionados.filter((s) => s !== id));
    } else {
      setSalonesSeleccionados([...salonesSeleccionados, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-2xl w-full space-y-4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-bold">Crear publicación</h2>

        <input
          type="text"
          placeholder="Título"
          className="w-full border px-3 py-2 rounded"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          ref={textareaRef}
          rows={3}
          placeholder="Descripción (puedes usar emojis 😊)"
          className="w-full border px-3 py-2 rounded resize-none overflow-hidden"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />

        {/* Imagen */}
        <div className="border-dashed border-2 border-gray-300 p-4 rounded text-center">
          <label className="block font-medium mb-2">Imagen destacada</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImagen(e.target.files?.[0] || null)}
            className="w-full"
          />
          {imagen && (
            <p className="text-sm mt-2 text-green-600">Archivo seleccionado: {imagen.name}</p>
          )}
        </div>

        {/* Monto */}
        <input
          type="text"
          placeholder="Monto (ej. $30.000)"
          className="w-full border px-3 py-2 rounded"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
        />

        {/* Horario */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm block mb-1">Desde</label>
            <select
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecciona</option>
              {HORAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm block mb-1">Hasta</label>
            <select
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">Selecciona</option>
              {HORAS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacidad */}
        <input
          type="text"
          placeholder="Capacidad (ej. 1-10)"
          className="w-full border px-3 py-2 rounded"
          value={capacidad}
          onChange={(e) => setCapacidad(e.target.value)}
        />

        {/* Salones */}
        <div>
          <label className="text-sm block mb-1">Salones</label>
          <div className="flex flex-wrap gap-2">
            {salonesDisponibles.map((salon) => (
              <button
                key={salon.id}
                onClick={() => toggleSalon(salon.nombre)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  salonesSeleccionados.includes(salon.nombre)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {salon.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Activa */}
        <div className="flex items-center gap-2">
          <input type="checkbox" checked={activa} onChange={() => setActiva(!activa)} />
          <label>Publicación activa</label>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            Cancelar
          </button>
          <button onClick={guardar} className="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
