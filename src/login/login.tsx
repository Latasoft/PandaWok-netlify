import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // <-- import axios
import logo from '../assets/wokpanda-white.png';

const globalInputStyles = `
  input:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(255, 90, 0, 0.2) !important;
    border-color: #FF5A00 !important;
  }
`;

interface User {
  id: number;
  nombre_usuario: string;
  correo_electronico: string;
  rol: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const navigate = useNavigate();

  // Modifica el useEffect para redirigir automáticamente
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalInputStyles;
    document.head.appendChild(styleEl);

    // Cargar user + token de localStorage si existe
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      // Redirigir automáticamente al timeline
      navigate('/timeline');
    }

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        {
          correo_electronico: email,
          contrasena: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setUser(data.user);
      setError(null);
      setLoading(false);

      navigate('/timeline');
    } catch (error: any) {
      if (error.response) {
        setError(error.response.data.message || 'Error al iniciar sesión');
      } else if (error.request) {
        setError('No se pudo conectar al servidor. Intente más tarde.');
      } else {
        setError(error.message || 'Error inesperado');
      }
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7ED' }}>
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden mx-2 sm:mx-0">
          <div className="py-4 flex justify-center" style={{ backgroundColor: '#211B17' }}>
            <img src={logo} alt="PandaWok Logo" className="h-16 w-auto object-contain" />
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6" noValidate>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                placeholder="ejemplo@pandawok.com"
                style={{ WebkitAppearance: 'none' }}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 pr-10 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  placeholder="Ingrese su contraseña"
                  style={{ WebkitAppearance: 'none' }}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                to="/recuperar-contraseña"
                className="text-sm hover:text-gray-700"
                style={{ color: '#FF5A00' }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 text-white rounded-lg font-medium shadow-md hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              style={{ backgroundColor: '#FF5A00', color: 'white' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>PandaWok © {new Date().getFullYear()} - Sistema de Reservas</p>
            </div>
          </form>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-gray-500">
        <p>Desarrollado por Latasoft</p>
      </div>
    </div>
  );
};

export default Login;
