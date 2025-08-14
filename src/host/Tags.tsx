import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiTag, FiTrash2 } from 'react-icons/fi';

interface TagMap {
  [categoria: string]: {
    [subcategoria: string]: string[];
  };
}

interface TagParaEliminar {
  nombre: string;
  categoria: string;
  subcategoria: string;
}

axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Tags() {
  const [tags, setTags] = useState<TagMap>({});
  const [nuevoTag, setNuevoTag] = useState('');
  const [categoria, setCategoria] = useState('');
  const [subcategoria, setSubcategoria] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Estado para el tag que se desea eliminar (para confirmar)
  const [tagParaEliminar, setTagParaEliminar] = useState<TagParaEliminar | null>(null);

  const coloresSubcategoria = [
    '#EF4444',
    '#F59E0B',
    '#10B981',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#6366F1',
    '#14B8A6',
  ];

  const obtenerColorSubcategoria = (index: number) =>
    coloresSubcategoria[index % coloresSubcategoria.length];

  useEffect(() => {
    obtenerTags();
  }, []);

  const obtenerTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<TagMap>('/api/tags/categorias');
      setTags(res.data);
    } catch {
      setError('Error al cargar los tags');
    } finally {
      setLoading(false);
    }
  };

  const crearTag = async () => {
    const nombre = nuevoTag.trim();
    if (!nombre) return setInputError('El nombre no puede estar vacío.');
    if (!categoria) return setInputError('Selecciona una categoría.');
    if (!subcategoria) return setInputError('Selecciona una subcategoría.');

    const existe = tags[categoria]?.[subcategoria]?.some(
      (tag) => tag.toLowerCase() === nombre.toLowerCase()
    );
    if (existe) return setInputError('Este tag ya existe.');

    try {
      setLoading(true);
      setError(null);
      await axios.post('/api/tags', { nombre, categoria, subcategoria });
      setNuevoTag('');
      setCategoria('');
      setSubcategoria('');
      setInputError(null);
      await obtenerTags();
    } catch {
      setError('Error al crear el tag');
    } finally {
      setLoading(false);
    }
  };

  // Esta función ahora solo abre el modal para confirmar
  const confirmarEliminarTag = (nombre: string, categoria: string, subcategoria: string) => {
    setTagParaEliminar({ nombre, categoria, subcategoria });
  };

  // Ejecutar la eliminación real después de confirmación
  const eliminarTag = async () => {
    if (!tagParaEliminar) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get('/api/tags');
      const tag = res.data.find(
        (t: any) =>
          t.nombre === tagParaEliminar.nombre &&
          t.categoria === tagParaEliminar.categoria &&
          t.subcategoria === tagParaEliminar.subcategoria
      );
      if (!tag) {
        setError('Tag no encontrado');
        setTagParaEliminar(null);
        return;
      }

      await axios.delete(`/api/tags/${tag.id}`);
      setTagParaEliminar(null);
      await obtenerTags();
    } catch {
      setError('Error al eliminar tag');
    } finally {
      setLoading(false);
    }
  };

  // Cancelar la eliminación y cerrar modal
  const cancelarEliminar = () => {
    setTagParaEliminar(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 relative">
      <h1 className="text-4xl font-bold text-red-700 mb-8 text-center select-none tracking-tight">
        Gestión de Tags
      </h1>

      <div className="flex flex-col gap-4 mb-10">
        <input
          type="text"
          placeholder="Nuevo tag"
          value={nuevoTag}
          onChange={(e) => {
            setNuevoTag(e.target.value);
            setInputError(null);
          }}
          className={`px-4 py-3 rounded border w-full ${
            inputError && !nuevoTag.trim() ? 'border-red-600' : 'border-gray-300'
          }`}
        />

        <div className="flex gap-4 flex-wrap">
          <select
            value={categoria}
            onChange={(e) => {
              setCategoria(e.target.value);
              setSubcategoria('');
              setInputError(null);
            }}
            className={`px-4 py-3 rounded border w-full sm:w-1/2 ${
              inputError && !categoria ? 'border-red-600' : 'border-gray-300'
            }`}
            aria-label="Selecciona categoría"
          >
            <option value="">Selecciona Categoría</option>
            {Object.keys(tags).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={subcategoria}
            onChange={(e) => {
              setSubcategoria(e.target.value);
              setInputError(null);
            }}
            className={`px-4 py-3 rounded border w-full sm:w-1/2 ${
              inputError && !subcategoria ? 'border-red-600' : 'border-gray-300'
            }`}
            disabled={!categoria}
            aria-label="Selecciona subcategoría"
          >
            <option value="">Selecciona Subcategoría</option>
            {categoria &&
              Object.keys(tags[categoria] || {}).map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
          </select>
        </div>

        {inputError && (
          <p className="text-red-600 font-semibold select-none mt-1">{inputError}</p>
        )}

        <button
          onClick={crearTag}
          disabled={loading || !nuevoTag.trim() || !categoria || !subcategoria}
          className="bg-red-700 text-white px-6 py-3 rounded hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md transition mt-2"
          aria-label="Agregar tag"
        >
          Agregar Tag
        </button>
      </div>

      {error && (
        <p className="mb-6 text-center text-red-600 font-medium select-none">{error}</p>
      )}

      {Object.keys(tags).length === 0 && !loading && (
        <p className="text-center text-gray-500 select-none italic">No hay tags registrados.</p>
      )}

      {/* Lista organizada por categoría y subcategoría */}
      {Object.entries(tags).map(([cat, subs]) => (
        <div
          key={cat}
          className="mb-10 border rounded-lg shadow-sm border-red-300 bg-red-50 p-6"
          aria-label={`Categoría ${cat}`}
        >
          <h2 className="text-3xl font-extrabold text-red-800 mb-6 select-none border-b border-red-300 pb-2">
            {cat}
          </h2>

          {Object.entries(subs).map(([sub, tagList], index) => {
            const color = obtenerColorSubcategoria(index);
            return (
              <div
                key={sub}
                className="mb-6 rounded border px-5 py-4 shadow-sm"
                style={{ borderColor: color }}
                aria-label={`Subcategoría ${sub}`}
              >
                <h3
                  className="text-xl font-semibold mb-3 select-none"
                  style={{ color }}
                >
                  {sub}
                </h3>

                <ul className="flex flex-wrap gap-3">
                  {tagList.map((nombre) => (
                    <li
                      key={nombre}
                      className="flex items-center gap-2 bg-white border border-gray-300 rounded px-4 py-2 shadow-sm"
                      role="listitem"
                    >
                      <FiTag className="text-red-700" />
                      <span className="font-medium text-gray-800">{nombre}</span>
                      <button
                        onClick={() => confirmarEliminarTag(nombre, cat, sub)}
                        className="ml-3 text-red-700 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-600 rounded"
                        aria-label={`Eliminar tag ${nombre}`}
                        title={`Eliminar tag ${nombre}`}
                        disabled={loading}
                        type="button"
                      >
                        <FiTrash2 />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal de confirmación de eliminación */}
      {tagParaEliminar && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(6px)' }}
        >
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-2xl text-center">
            <h2 className="text-2xl font-semibold mb-5 select-none text-gray-900">
              Confirmar eliminación
            </h2>
            <p className="mb-8 text-gray-700 select-text text-lg">
              ¿Seguro que quieres eliminar el tag{' '}
              <span className="font-bold text-red-700">{tagParaEliminar.nombre}</span> de la subcategoría{' '}
              <span className="font-bold text-red-700">{tagParaEliminar.subcategoria}</span> en categoría{' '}
              <span className="font-bold text-red-700">{tagParaEliminar.categoria}</span>?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={eliminarTag}
                className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-semibold shadow-md transition"
                aria-label="Confirmar eliminar tag"
                type="button"
                disabled={loading}
              >
                Sí, eliminar
              </button>
              <button
                onClick={cancelarEliminar}
                className="border border-gray-400 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold transition"
                aria-label="Cancelar eliminación"
                type="button"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
