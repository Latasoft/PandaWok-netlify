import React from 'react';
import logo from '../assets/pandawok-brown.png';

const LockedReservationPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{ backgroundColor: '#211B17' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-gray-200 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={logo} alt="Panda wok" className="h-20 w-auto" />
        </div>

        {/* Valentine's Day Decoration */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <span className="text-4xl">💕</span>
          <span className="text-4xl">🍜</span>
          <span className="text-4xl">💕</span>
        </div>

        {/* Main Message */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#C41E3A' }}>
          Reservas Bloqueadas
        </h1>

        <p className="text-2xl font-semibold text-gray-700 mb-6">
          14 de Febrero
        </p>

        {/* Decorative separator */}
        <div className="flex justify-center items-center gap-2 mb-8">
          <div className="h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent" style={{ width: '100px' }}></div>
          <span className="text-3xl">✨</span>
          <div className="h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent" style={{ width: '100px' }}></div>
        </div>

        {/* Description */}
        <div className="mb-8 space-y-4">
          <p className="text-lg text-gray-600 leading-relaxed">
            En este especial día de amor y amistad, nuestro restaurante estará celebrando con nuestro equipo.
          </p>
          <p className="text-lg font-semibold text-orange-600">
            Las reservas para el 14 de febrero están cerradas.
          </p>
        </div>

        {/* Heart animation decoration */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="animate-bounce" style={{ animationDelay: '0s' }}>
            <span className="text-2xl">❤️</span>
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.2s' }}>
            <span className="text-2xl">🌸</span>
          </div>
          <div className="animate-bounce" style={{ animationDelay: '0.4s' }}>
            <span className="text-2xl">❤️</span>
          </div>
        </div>

        {/* Alternative option */}
        <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-6 mb-8">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold text-orange-600">¿Quieres reservar en otra fecha?</span>
          </p>
          <p className="text-sm text-gray-600">
            Puedes hacer tu reserva para el 13, 15 de febrero o cualquier otra fecha disponible.
          </p>
        </div>

        {/* CTA Button */}
        <a
          href="/"
          onClick={() => window.location.reload()}
          className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Volver a Intentar
        </a>

        {/* Footer message */}
        <p className="text-gray-500 text-sm mt-8">
          ¡Gracias por tu comprensión! 🙏
        </p>
      </div>
    </div>
  );
};

export default LockedReservationPage;
