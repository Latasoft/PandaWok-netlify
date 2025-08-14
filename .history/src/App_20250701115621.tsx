import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login/login.tsx'
import RecoverPassword from './login/RecoverPassword.tsx';
import Timeline from './host/timeline';
import ReservationForm from './reservation/ReservationForm';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-contraseña" element={<RecoverPassword />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/reservation" element={<ReservationForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
