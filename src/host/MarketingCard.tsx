import { ClipboardIcon } from '@heroicons/react/24/outline';

type Props = {
  publicacion: any;
  onEliminar: () => void;
  onToggle: () => void;
};

export default function MarketingCard({ publicacion, onEliminar, onToggle }: Props) {
  const {
    titulo,
    descripcion,
    imagen,
    activa,
    monto,
    horario,
    capacidad,
    salones,
  } = publicacion;

  const copiarURL = () => {
    navigator.clipboard.writeText(publicacion.url || 'https://example.com/publicacion');
    alert('URL copiada al portapapeles');
  };

  return (
    <div className="bg-white border rounded-lg p-5 shadow relative w-full flex gap-6 flex-col sm:flex-row">
      {/* Estado y toggle */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <span
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            activa ? 'bg-green-200 text-green-800' : 'bg-gray-300 text-gray-700'
          }`}
        >
          {activa ? 'Activa' : 'Inactiva'}
        </span>
        <label className="inline-flex relative items-center cursor-pointer">
          <input
            type="checkbox"
            checked={activa}
            className="sr-only peer"
            onChange={onToggle}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:left-[4px] after:top-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
        </label>
      </div>

      {/* Imagen a la izquierda */}
      {imagen && (
        <div className="flex-shrink-0 w-full sm:w-40 h-40 rounded overflow-hidden border border-gray-200">
          <img
            src={URL.createObjectURL(imagen)}
            alt="imagen"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Contenido a la derecha */}
      <div className="flex flex-col flex-grow min-w-0">
        <h2
          className="text-2xl font-semibold mb-2 text-gray-900 leading-snug"
          title={titulo}
          style={{ wordBreak: 'break-word' }}
        >
          {titulo}
        </h2>

        <p
          className="mb-4 text-gray-700 whitespace-pre-line"
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
          title={descripcion}
        >
          {descripcion}
        </p>

        {/* Detalles de abajo */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 border-t pt-3 mt-auto">
          <span className="truncate max-w-[120px]" title={monto || 'Sin Monto'}>
            💰 {monto || 'Sin Monto'}
          </span>
          <span className="truncate max-w-[100px]" title={horario}>
            🕒 {horario}
          </span>
          <span className="truncate max-w-[80px]" title={capacidad}>
            👥 {capacidad}
          </span>
          {salones?.map((s: string, i: number) => (
            <span
              key={i}
              className="bg-gray-100 px-2 py-1 rounded text-xs truncate max-w-[80px]"
              title={s}
            >
              {s}
            </span>
          ))}
        </div>

        {/* Botones */}
        <div className="mt-4 flex justify-end gap-4 flex-wrap">
          <button
            onClick={copiarURL}
            className="flex items-center gap-2 text-blue-600 border border-blue-600 rounded px-3 py-1 text-sm hover:bg-blue-50"
            type="button"
          >
            <ClipboardIcon className="w-4 h-4" />
            Copiar URL
          </button>
          <button
            onClick={onEliminar}
            className="text-red-600 text-sm hover:underline"
            type="button"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
