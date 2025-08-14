import { Outlet } from 'react-router-dom';
import Sidebar from '../components/SideBar';

export default function AdminPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 w-full min-h-screen bg-gray-100 p-4">
        <Outlet />
      </main>
    </div>
  );
}
