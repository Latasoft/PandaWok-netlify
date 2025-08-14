import { useState } from 'react';
import MarketingCard from './MarketingCard';
import MarketingModal from '../components/MarketingModal';

export default function Marketing() {
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'inactivas'>('todas');

  const agregarPublicacion = (data: any) => {
    setPublicaciones([...publicaciones, { ...data, id: Date.now() }]);
    setShowModal(false);
  };

  const eliminarPublicacion = (id: number) => {
    setPublicaciones(publicaciones.filter((p) => p.id !== id));
  };

  const actualizarEstado = (id: number, nuevaActiva: boolean) => {
    setPublicaciones(
      publicaciones.map((p) =>
        p.id === id ? { ...p, activa: nuevaActiva } : p
      )
    );
  };

  const publicacionesFiltradas = publicaciones.filter((p) => {
    if (filtro === 'activas') return p.activa;
    if (filtro === 'inactivas') return !p.activa;
    return true; // todas
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Marketing</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded border ${
              filtro === 'todas'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('activas')}
            className={`px-4 py-2 rounded border ${
              filtro === 'activas'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Activas
          </button>
          <button
            onClick={() => setFiltro('inactivas')}
            className={`px-4 py-2 rounded border ${
              filtro === 'inactivas'
                ? 'bg-gray-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Inactivas
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto"
          >
            Crear publicación
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-6">
        {publicacionesFiltradas.length === 0 ? (
          <p className="text-gray-500">No hay publicaciones {filtro}.</p>
        ) : (
          publicacionesFiltradas.map((pub) => (
            <MarketingCard
              key={pub.id}
              publicacion={pub}
              onEliminar={() => eliminarPublicacion(pub.id)}
              onToggle={() => actualizarEstado(pub.id, !pub.activa)}
            />
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <MarketingModal onClose={() => setShowModal(false)} onSave={agregarPublicacion} />
      )}
    </div>
  );
}
