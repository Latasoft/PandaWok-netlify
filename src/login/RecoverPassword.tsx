import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/wokpanda-white.png';

const globalInputStyles = `
  input:focus {
    outline: none !important;
    box-shadow: 0 0 0 2px rgba(255, 90, 0, 0.2) !important;
    border-color: #FF5A00 !important;
  }
`;

const RecoverPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);

    try {
      console.log('Intentando recuperar contraseña para:', { email });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (error) {
      setError('No se pudo procesar su solicitud. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = globalInputStyles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F7F7ED' }}>
              <div className="flex-1 flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg overflow-hidden mx-2 sm:mx-0">
          <div className="py-4 flex items-center relative" style={{ backgroundColor: '#211B17' }}>
            <Link to="/login" className="absolute left-4 text-white hover:text-orange-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1 flex justify-center">
              <img src={logo} alt="PandaWok Logo" className="h-16 w-auto object-contain" />
            </div>
          </div>

          {success ? (
            <div className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-center mb-3" style={{ color: '#211B17' }}>Recuperar Contraseña</h2>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña.
              </div>

              <div className="space-y-4 text-center">
                <p className="text-gray-600">Revise su bandeja de entrada y siga las instrucciones en el correo.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <h2 className="text-xl font-bold text-center mb-3" style={{ color: '#211B17' }}>Recuperar Contraseña</h2>
              <p className="text-gray-600 text-sm text-center mb-3">
                Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
              </p>

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
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
                  placeholder="ejemplo@pandawok.com"
                  style={{ WebkitAppearance: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 text-white rounded-lg font-medium shadow-md hover:brightness-90 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                style={{ backgroundColor: '#FF5A00', color: 'white' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar'
                )}
              </button>
            </form>
          )}

          <div className="mt-2 pb-6 text-center text-sm text-gray-600">
            <p>PandaWok © {new Date().getFullYear()} - Sistema de Reservas</p>
          </div>
        </div>
      </div>

      <div className="py-4 text-center text-xs text-gray-500">
        <p>Desarrollado por Latasoft</p>
      </div>
    </div>
  );
};

export default RecoverPassword;
