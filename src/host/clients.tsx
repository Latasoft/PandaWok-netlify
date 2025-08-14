// src/pages/Clients.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TagsModal from '../components/TagsModal';
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa';

export interface Client {
  id: string;
  nombre: string;
  apellido: string;
  correo_electronico: string;
  telefono: string;
  visitas: number;
  ultima_visita: string | null;
  tags: string[];
  gasto_total: number;
  gasto_por_visita: number;
  notas: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Colores adaptados a tonos cafés:
const TAG_COLOR_MAP: Record<string, string> = {
  'Área de Fumadores': 'bg-yellow-700',
  'Área del Bar': 'bg-yellow-700',
  Booth: 'bg-yellow-700',
  Esquina: 'bg-yellow-700',
  Fumador: 'bg-yellow-700',
  Interior: 'bg-yellow-700',
  'Mesa con Vista': 'bg-yellow-700',
  'Mesa Tranquila': 'bg-yellow-700',
  'Salón Principal': 'bg-yellow-700',
  Terraza: 'bg-yellow-700',
  Ventana: 'bg-yellow-700',

  Alergia: 'bg-green-700',
  Huevos: 'bg-green-700',
  'Libre de Gluten': 'bg-green-700',
  'Libre de Lactosa': 'bg-green-700',
  Mariscos: 'bg-green-700',
  'Sin Maní': 'bg-green-700',
  Vegano: 'bg-green-700',
  Vegetariano: 'bg-green-700',

  'Alto Consumo': 'bg-orange-700',
  VIP: 'bg-orange-700',

  'Cliente frecuente': 'bg-gray-500',
};

const getTagColor = (tag: string) => TAG_COLOR_MAP[tag] || 'bg-gray-400';

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Crear modal
  const [showCreate, setShowCreate] = useState(false);
  const [newData, setNewData] = useState<Partial<Client> & { tags: string[] }>({ tags: [] });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [showTagsCreate, setShowTagsCreate] = useState(false);

  // Editar modal
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState<Partial<Client> & { tags: string[] }>({ tags: [] });
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [showTagsEdit, setShowTagsEdit] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<{ success: boolean; data: any[] }>(`${API_BASE_URL}/api/clients`);
      const mapped: Client[] = data.data.map((c) => ({
        id: String(c.id),
        nombre: c.nombre,
        apellido: c.apellido,
        correo_electronico: c.correo_electronico,
        telefono: c.telefono,
        visitas: Number(c.visitas) || 0,
        ultima_visita: c.ultima_visita ?? null,
        tags: Array.isArray(c.tags) ? c.tags : [],
        gasto_total: Number(c.gasto_total) || 0,
        gasto_por_visita: Number(c.gasto_por_visita) || 0,
        notas: c.notas || '',
      }));
      setClients(mapped);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = clients.filter((c) => {
    if (!appliedSearch) return true;
    const t = appliedSearch.toLowerCase();
    return (
      (`${c.nombre} ${c.apellido}`).toLowerCase().includes(t) ||
      c.telefono.toLowerCase().includes(t) ||
      c.correo_electronico.toLowerCase().includes(t) ||
      c.tags.some((tg) => tg.toLowerCase().includes(t))
    );
  });

  function applyFilter() {
    setAppliedSearch(search);
  }

  function exportExcel() {
    const ws = XLSX.utils.json_to_sheet(
      clients.map((c) => ({
        ID: c.id,
        Nombre: `${c.nombre} ${c.apellido}`,
        Teléfono: c.telefono,
        Correo: c.correo_electronico,
        Visitas: c.visitas,
        'Última Visita': c.ultima_visita ?? '-',
        Tags: c.tags.join(', '),
        'Gasto Total (CLP)': c.gasto_total.toFixed(2),
        'Gasto Promedio por Visita (CLP)': c.gasto_por_visita.toFixed(2),
        Notas: c.notas,
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `clientes_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async function handleCreate() {
    setCreateError(null);
    if (!newData.nombre || !newData.apellido || !newData.correo_electronico) {
      setCreateError('Nombre, apellido y correo son obligatorios');
      return;
    }
    setCreating(true);
    try {
      const { data } = await axios.post<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/api/clients`,
        newData
      );
      if (data.success) {
        setShowCreate(false);
        setNewData({ tags: [] });
        fetchClients();
      } else {
        setCreateError(data.message || 'Error al crear');
      }
    } catch (err: any) {
      setCreateError(err.response?.data?.message || err.message);
    } finally {
      setCreating(false);
    }
  }

  function openEdit(c: Client) {
    setEditData({ ...c });
    setShowEdit(true);
    setEditError(null);
  }

  // Calcula gasto_total automáticamente en base a visitas * gasto_por_visita
  function handleEditField<K extends keyof Client>(field: K, value: Client[K]) {
    let newEditData = { ...editData, [field]: value };

    if (field === 'visitas' || field === 'gasto_por_visita') {
      const visitas = Number(field === 'visitas' ? value : newEditData.visitas ?? 0);
      const gastoPorVisita = Number(field === 'gasto_por_visita' ? value : newEditData.gasto_por_visita ?? 0);
      newEditData.gasto_total = visitas * gastoPorVisita;
    }

    setEditData(newEditData);
  }

  async function handleEdit() {
    if (!editData.id) return;
    setEditing(true);
    try {
      const { data } = await axios.put<{ success: boolean; message?: string }>(
        `${API_BASE_URL}/api/clients/${editData.id}`,
        editData
      );
      if (data.success) {
        setShowEdit(false);
        fetchClients();
      } else {
        setEditError(data.message || 'Error al actualizar');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || err.message);
    } finally {
      setEditing(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('¿Eliminar cliente?')) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/api/clients/${id}`);

      if (!(response.status >= 200 && response.status < 300)) {
        throw new Error(`Error al eliminar cliente (status ${response.status})`);
      }

      fetchClients();
    } catch (error: any) {
      console.error('Error al eliminar cliente:', error);
      alert(error.response?.data?.message || error.message || 'Error al eliminar cliente');
    }
  }

  return (
    <div className="p-6 bg-[#F7F3ED] min-h-screen">
      {/* Controles */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, teléfono o tag..."
            className="px-4 py-2 border rounded-md focus:ring focus:ring-yellow-300 transition"
          />
          <button
            onClick={applyFilter}
            className="px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
          >
            Filtrar
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportExcel}
            className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
          >
            + Crear Cliente
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {loading && <p className="text-center">Cargando...</p>}
      {error && <p className="text-red-700">{error}</p>}

      {/* Tabla */}
      <div className="overflow-auto">
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-yellow-800 text-white">
            <tr>
              {[
                'Nombre',
                'Teléfono',
                'Correo',
                'Visitas',
                'Última Visita',
                'Tags',
                'Gasto Total (CLP)',
                'Gasto Promedio por Visita (CLP)',
                'Notas',
                'Acciones',
              ].map((h) => (
                <th key={h} className="px-4 py-2 text-left text-sm">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c, i) => (
              <tr
                key={c.id}
                className={`border-b transition-colors hover:bg-yellow-50 ${
                  i % 2 === 0 ? '' : 'bg-yellow-100'
                }`}
              >
                <td className="px-4 py-2">
                  {c.nombre} {c.apellido}
                </td>
                <td className="px-4 py-2">{c.telefono}</td>
                <td className="px-4 py-2">{c.correo_electronico}</td>
                <td className="px-4 py-2">{c.visitas}</td>
                <td className="px-4 py-2">{c.ultima_visita ?? '-'}</td>
                <td className="px-4 py-2 flex flex-wrap gap-1">
                  {c.tags.length ? (
                    c.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`${getTagColor(tag)} text-white text-xs px-2 py-1 rounded-full`}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-2 text-right">{c.gasto_total.toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{c.gasto_por_visita.toFixed(2)}</td>
                <td className="px-4 py-2">{c.notas}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-yellow-900 hover:text-yellow-800 transition"
                    aria-label={`Editar cliente ${c.nombre} ${c.apellido}`}
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-700 hover:text-red-900 transition"
                    aria-label={`Eliminar cliente ${c.nombre} ${c.apellido}`}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No hay clientes para mostrar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear */}
      {showCreate && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-transparent">
          {/* Modal Crear Cliente */}
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative z-50">
            <h2 className="text-xl mb-4">Crear Cliente</h2>
            {createError && <p className="text-red-700 mb-2">{createError}</p>}

            <div className="space-y-2">
              <input
                placeholder="Nombre"
                value={newData.nombre || ''}
                onChange={(e) => setNewData({ ...newData, nombre: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Apellido"
                value={newData.apellido || ''}
                onChange={(e) => setNewData({ ...newData, apellido: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Correo"
                type="email"
                value={newData.correo_electronico || ''}
                onChange={(e) => setNewData({ ...newData, correo_electronico: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Teléfono"
                value={newData.telefono || ''}
                onChange={(e) => setNewData({ ...newData, telefono: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <textarea
                placeholder="Notas"
                value={newData.notas || ''}
                onChange={(e) => setNewData({ ...newData, notas: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
                rows={3}
              />
              <button
                onClick={() => setShowTagsCreate(true)}
                className="w-full px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
              >
                Tags ({newData.tags.length})
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowCreate(false)}
                disabled={creating}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
              >
                {creating ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>

          {/* Sidebar TagsModal */}
          {showTagsCreate && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <TagsModal
                isOpen={showTagsCreate}
                onClose={() => setShowTagsCreate(false)}
                onApplyTags={(tags) => {
                  setNewData((d) => ({ ...d, tags }));
                  setShowTagsCreate(false);
                }}
                currentSelectedTags={newData.tags}
              />
            </div>
          )}
        </div>
      )}


      {/* Modal Editar */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-transparent">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl mb-4">Editar Cliente</h2>
            {editError && <p className="text-red-700 mb-2">{editError}</p>}

            <div className="space-y-2">
              <input
                placeholder="Nombre"
                value={editData.nombre || ''}
                onChange={(e) => handleEditField('nombre', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Apellido"
                value={editData.apellido || ''}
                onChange={(e) => handleEditField('apellido', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Correo"
                type="email"
                value={editData.correo_electronico || ''}
                onChange={(e) => handleEditField('correo_electronico', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Teléfono"
                value={editData.telefono || ''}
                onChange={(e) => handleEditField('telefono', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <input
                placeholder="Número total de visitas del cliente"
                type="number"
                min={0}
                value={editData.visitas ?? 0}
                onChange={(e) => handleEditField('visitas', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad total de veces que el cliente ha visitado el local.
              </p>

              <input
                placeholder="Promedio gastado por visita (CLP)"
                type="number"
                min={0}
                step={0.01}
                value={editData.gasto_por_visita ?? 0}
                onChange={(e) => handleEditField('gasto_por_visita', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Monto promedio que el cliente gasta en cada visita.
              </p>

              <input
                placeholder="Gasto Total (Calculado automáticamente)"
                type="number"
                disabled
                value={editData.gasto_total?.toFixed(2) ?? '0.00'}
                className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                Calculado automáticamente: Visitas × Gasto por visita
              </p>

              <textarea
                placeholder="Notas"
                value={editData.notas || ''}
                onChange={(e) => handleEditField('notas', e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:ring transition"
                rows={3}
              />

              <button
                onClick={() => setShowTagsEdit(true)}
                className="w-full px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
              >
                Tags ({editData.tags?.length ?? 0})
              </button>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowEdit(false)}
                disabled={editing}
                className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleEdit}
                disabled={editing}
                className="px-4 py-2 bg-yellow-700 text-white rounded-md hover:bg-yellow-800 transition"
              >
                {editing ? 'Guardando...' : 'Guardar'}
              </button>
            </div>

            <TagsModal
              isOpen={showTagsEdit}
              onClose={() => setShowTagsEdit(false)}
              onApplyTags={(tags) => {
                setEditData((d) => ({ ...d, tags }));
                setShowTagsEdit(false);
              }}
              currentSelectedTags={editData.tags}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
