import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrashAlt, FaPencilAlt } from 'react-icons/fa';

interface User {
  id: number | string;
  nombre_usuario: string;
  apellido_usuario?: string;
  correo_electronico: string;
  rol: string;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Simulación usuario logueado (reemplaza con tu lógica real, ej localStorage o context)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));

    fetchUsers();
  }, []);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      alert('Error al cargar usuarios');
    }
  };

  const handleOpenNewUserModal = () => setIsNewUserModalOpen(true);
  const handleCloseModal = () => {
    setIsNewUserModalOpen(false);
    setIsEditUserModalOpen(false);
    setEditingUser(null);
  };

  const handleEditClick = (userId: number | string) => {
    const userToEdit = users.find((u) => u.id === userId) || null;
    setEditingUser(userToEdit);
    setIsEditUserModalOpen(true);
  };

  // Crear usuario
  const handleNewUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const newUser = {
      nombre_usuario: (form.elements.namedItem('newUserName') as HTMLInputElement).value,
      apellido_usuario: (form.elements.namedItem('newUserLastName') as HTMLInputElement)?.value || '',
      correo_electronico: (form.elements.namedItem('newUserEmail') as HTMLInputElement).value,
      contrasena: (form.elements.namedItem('newUserPassword') as HTMLInputElement).value,
      rol: (form.elements.namedItem('newUserRole') as HTMLSelectElement).value.toLowerCase(),
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/users`, newUser);
      setUsers((prev) => [...prev, res.data.user]);
      alert('Usuario creado exitosamente');
      handleCloseModal();
      form.reset();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message || 'Error al crear usuario'}`);
    }
  };

  // Editar usuario
  const handleEditUserSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;

    const updatedUser = {
      nombre_usuario: (form.elements.namedItem('editUserName') as HTMLInputElement).value,
      apellido_usuario: (form.elements.namedItem('editUserLastName') as HTMLInputElement)?.value || '',
      correo_electronico: (form.elements.namedItem('editUserEmail') as HTMLInputElement).value,
      rol: (form.elements.namedItem('editUserRole') as HTMLSelectElement).value.toLowerCase(),
    };

    const userId = (form.elements.namedItem('editUserId') as HTMLInputElement).value;

    try {
      const res = await axios.put(`${API_BASE_URL}/api/users/${userId}`, updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.data.user : u)));
      alert('Usuario actualizado exitosamente');
      handleCloseModal();
    } catch (error: any) {
      alert(`Error: ${error.response?.data?.message || error.message || 'Error al actualizar usuario'}`);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id: number | string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert('Usuario eliminado correctamente');
    } catch (error: any) {
      alert(`Error eliminando usuario: ${error.response?.data?.message || error.message || 'Error'}`);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#F7F7ED] text-[#3C2022] font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-300">
          <h2 className="text-3xl font-bold mb-4 md:mb-0" style={{ color: '#CC5500' }}>
            Administrar Usuarios
          </h2>
          {currentUser?.rol === 'administrador' && (
            <button
              onClick={handleOpenNewUserModal}
              className="px-6 py-3 rounded-lg shadow-md text-white font-semibold transition-colors duration-300 bg-[#CC5500] hover:bg-[#FF6B00]"
            >
              Nuevo Usuario
            </button>
          )}
        </header>

        <div className="overflow-x-auto bg-white rounded-lg shadow-lg p-6">
          {users.length === 0 ? (
            <p className="text-center py-10 text-gray-600">No hay usuarios para mostrar.</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Nombre</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Apellido</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Correo Electrónico</th>
                  <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Rol</th>
                  {currentUser?.rol === 'administrador' && <th className="py-3 px-4 text-left font-semibold text-sm uppercase tracking-wide">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4">{user.nombre_usuario}</td>
                    <td className="py-3 px-4">{user.apellido_usuario}</td>
                    <td className="py-3 px-4">{user.correo_electronico}</td>
                    <td className="py-3 px-4">{user.rol}</td>
                    {currentUser?.rol === 'administrador' && (
                      <td className="py-3 px-4 flex gap-3">
                        <button
                          className="text-[#CC5500] hover:text-[#FF6B00] text-lg p-1 transition duration-300 ease-in-out"
                          onClick={() => handleEditClick(user.id)}
                          title="Editar usuario"
                        >
                          <FaPencilAlt />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-700 text-lg p-1 transition duration-300 ease-in-out"
                          onClick={() => eliminarUsuario(user.id)}
                          title="Eliminar usuario"
                        >
                          <FaTrashAlt />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Nuevo Usuario */}
        {isNewUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-11/12 max-w-lg relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-6 text-gray-400 text-3xl font-bold hover:text-gray-700"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
              <h3 className="text-2xl font-semibold text-[#3C2022] mb-6 text-center">Nuevo Usuario</h3>
              <form onSubmit={handleNewUserSubmit}>
                <div className="mb-4">
                  <label htmlFor="newUserName" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="newUserName"
                    name="newUserName"
                    required
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newUserLastName" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Apellido:
                  </label>
                  <input
                    type="text"
                    id="newUserLastName"
                    name="newUserLastName"
                    required
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newUserEmail" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    id="newUserEmail"
                    name="newUserEmail"
                    required
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="newUserPassword" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Contraseña:
                  </label>
                  <input
                    type="password"
                    id="newUserPassword"
                    name="newUserPassword"
                    required
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="newUserRole" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Rol:
                  </label>
                  <select
                    id="newUserRole"
                    name="newUserRole"
                    required
                    defaultValue="anfitrion"
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="jefe">Jefe</option>
                    <option value="anfitrion">Anfitrión</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#CC5500] hover:bg-[#FF6B00] text-white font-semibold py-3 rounded-lg transition duration-300"
                >
                  Crear Usuario
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {isEditUserModalOpen && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-11/12 max-w-lg relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-6 text-gray-400 text-3xl font-bold hover:text-gray-700"
                aria-label="Cerrar modal"
              >
                &times;
              </button>
              <h3 className="text-2xl font-semibold text-[#3C2022] mb-6 text-center">Editar Usuario</h3>
              <form onSubmit={handleEditUserSubmit}>
                <input type="hidden" id="editUserId" name="editUserId" value={editingUser.id} />
                <div className="mb-4">
                  <label htmlFor="editUserName" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    id="editUserName"
                    name="editUserName"
                    required
                    defaultValue={editingUser.nombre_usuario}
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editUserLastName" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Apellido:
                  </label>
                  <input
                    type="text"
                    id="editUserLastName"
                    name="editUserLastName"
                    required
                    defaultValue={editingUser.apellido_usuario}
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="editUserEmail" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Correo Electrónico:
                  </label>
                  <input
                    type="email"
                    id="editUserEmail"
                    name="editUserEmail"
                    required
                    defaultValue={editingUser.correo_electronico}
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="editUserRole" className="block text-[#3C2022] text-sm font-medium mb-2">
                    Rol:
                  </label>
                  <select
                    id="editUserRole"
                    name="editUserRole"
                    required
                    defaultValue={editingUser.rol}
                    className="shadow-sm border border-gray-300 rounded w-full py-2 px-3 text-[#3C2022] focus:outline-none focus:ring-2 focus:ring-[#CC5500]"
                  >
                    <option value="administrador">Administrador</option>
                    <option value="jefe">Jefe</option>
                    <option value="anfitrion">Anfitrión</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#CC5500] hover:bg-[#FF6B00] text-white font-semibold py-3 rounded-lg transition duration-300"
                >
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
