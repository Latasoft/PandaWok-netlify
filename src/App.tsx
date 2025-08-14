import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import Login from './login/login';
import RecoverPassword from './login/RecoverPassword';
import Timeline from './host/timeline';
import ReservationForm from './reservation/ReservationForm';
import ClientsList from './host/clients';
import RequestPage from './host/RequestPage';
import Header from './components/Header';
import ListaEsperaPage from './host/ListaEsperaPage';
import AdminUsersPage from './host/AdminUsersPage';
import MesaBloqueosPage from './host/MesaBloqueosPage';
import BloqueosPage from './host/Bloqueos';
import ReportesPage from './host/Reportes';

import AdminPage from './host/Admin';
import Marketing from './host/Marketing';
import Tags from './host/Tags';
import ConfirmarReservaCliente from './host/ConfirmarReservaCliente'; // Importamos el componente nuevo
import ConfirmarReserva from "./host/ConfirmarReserva";


const mockSalones = [
  { id: '1', name: 'Salón Principal', tables: [] },
  { id: '2', name: 'Terraza Exterior', tables: [] },
];

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const token = localStorage.getItem('token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-contraseña" element={<RecoverPassword />} />

        {/* Ruta de confirmación de reserva (NO requiere login) */}
        <Route path="/confirmar-reserva/:token" element={<ConfirmarReservaCliente />} />

        {/* Rutas privadas generales */}
        <Route
          path="/timeline"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <Timeline />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/clientes"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <ClientsList />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <RequestPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/reservation"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <ReservationForm />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/lista-espera"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <ListaEsperaPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <AdminUsersPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/mesa-bloqueos"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <MesaBloqueosPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/bloqueos"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <BloqueosPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <ReportesPage />
              </>
            </PrivateRoute>
          }
        />
        <Route
          path="/confirmar-reserva"
          element={
            <PrivateRoute>
              <>
                <Header salones={mockSalones} />
                <ConfirmarReserva />
              </>
            </PrivateRoute>
          }
        />


        {/* Rutas privadas del panel de administración */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminPage />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="marketing" replace />} />
          <Route path="marketing" element={<Marketing />} />
          <Route path="tags" element={<Tags />} />
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
