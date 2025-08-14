import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons'; // Si usas Ant Design

export default function Sidebar() {
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-2 rounded hover:bg-gray-700 ${
      isActive ? 'bg-gray-700 text-white' : 'text-gray-300'
    }`;

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white fixed flex flex-col justify-between">
      <div>
        <div className="p-4 text-xl font-bold border-b border-gray-700">
          Admin Panel
        </div>
        <nav className="mt-4 flex flex-col gap-2 px-2">
          <NavLink to="/admin/marketing" className={navLinkClass}>
            Marketing
          </NavLink>
          <NavLink to="/admin/tags" className={navLinkClass}>
            Tags
          </NavLink>
        </nav>
      </div>

      {/* Botón Volver */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => navigate('/timeline')}
          className="flex items-center gap-2 text-gray-300 hover:text-white"
        >
          <ArrowLeftOutlined />
          <span>Volver</span>
        </button>
      </div>
    </aside>
  );
}
