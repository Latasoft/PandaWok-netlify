import React, { useState, useEffect } from 'react';
import ClientTagsModal from './ClientTagsModal';
import ReservationTagsModal from './ReservationTagsModal';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (requestData: any) => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose, onCreateRequest }) => {
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [clientTags, setClientTags] = useState<string[]>([]);
  const [reservationTags, setReservationTags] = useState<string[]>([]);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [reservationNote, setReservationNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [fecha, setFecha] = useState<string>('');
  const [hora, setHora] = useState<string>('');
  const [personas, setPersonas] = useState<number | ''>('');
  const [tipoReserva, setTipoReserva] = useState<string>('Reserva estándar');
  const [buscarComensal, setBuscarComensal] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const [isClientTagsModalOpen, setIsClientTagsModalOpen] = useState(false);
  const [isReservationTagsModalOpen, setIsReservationTagsModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTelefono('');
      setEmail('');
      setClientTags([]);
      setReservationTags([]);
      setMembershipNumber('');
      setReservationNote('');
      setSelectedFile(null);
      setFecha('');
      setHora('');
      setPersonas('');
      setTipoReserva('Reserva estándar');
      setBuscarComensal('');
      setNombre('');
      setApellido('');
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');

      setFecha(`${year}-${month}-${day}`);
      setHora(`${hours}:${minutes}`);
    }
  }, [isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requestData = {
      telefono,
      email,
      clientTags,
      reservationTags,
      membershipNumber,
      reservationNote,
      file: selectedFile ? selectedFile.name : null,
      fecha,
      hora,
      personas,
      tipoReserva,
      buscarComensal,
      nombre,
      apellido,
    };
    onCreateRequest(requestData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div
        className="relative bg-[#212133] rounded-lg shadow-xl w-full max-w-lg md:max-w-xl h-[90vh] flex flex-col"
      >
        {/* Header del modal - Siempre visible */}
        <div className="flex justify-between items-center p-4 border-b border-[#3C2022] bg-[#212133] z-10">
          <button onClick={onClose} className="text-white hover:text-gray-400 p-1" aria-label="Cerrar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-white">Nueva Solicitud</h2>
          <button type="submit" form="new-request-form" className="text-white hover:text-green-400 p-1" aria-label="Guardar solicitud">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        {/* Formulario - El contenido que se desplaza */}
        <form id="new-request-form" onSubmit={handleSubmit} className="p-6 flex-1 space-y-4 overflow-y-auto"
              // Estilo para el scrollbar en el área desplazable
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#B24E00 #212133',
              }}>
          {/* Fila 1: Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-gray-400 text-sm mb-1">Fecha</label>
              <div className="relative">
                <input
                  type="date"
                  id="fecha"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full p-2 rounded bg-[#33334F] text-white border border-transparent focus:border-orange-500 focus:ring-orange-500 appearance-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="hora" className="block text-gray-400 text-sm mb-1">Hora</label>
              <div className="relative">
                <input
                  type="time"
                  id="hora"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full p-2 rounded bg-[#33334F] text-white border border-transparent focus:border-orange-500 focus:ring-orange-500 appearance-none"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Fila 2: Personas y Tipo de reserva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="personas" className="block text-gray-400 text-sm mb-1">Personas</label>
              <input
                type="number"
                id="personas"
                value={personas}
                onChange={(e) => setPersonas(parseInt(e.target.value) || '')}
                placeholder="Ej: 2"
                min="1"
                className="w-full p-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="tipoReserva" className="block text-gray-400 text-sm mb-1">Tipo de reserva</label>
              <div className="relative">
                <select
                  id="tipoReserva"
                  value={tipoReserva}
                  onChange={(e) => setTipoReserva(e.target.value)}
                  className="w-full p-2 rounded bg-[#33334F] text-white border border-transparent focus:border-orange-500 focus:ring-orange-500 appearance-none"
                >
                  <option>Reserva estándar</option>
                  <option>Reserva VIP</option>
                  <option>Evento</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Buscar comensal */}
          <div>
            <label htmlFor="buscarComensal" className="block text-gray-400 text-sm mb-1">Buscar comensal</label>
            <div className="relative">
              <input
                type="text"
                id="buscarComensal"
                value={buscarComensal}
                onChange={(e) => setBuscarComensal(e.target.value)}
                placeholder="Buscar comensal"
                className="w-full pl-10 pr-4 py-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
            </div>
          </div>

          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-gray-400 text-sm mb-1">Nombre *</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full p-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="apellido" className="block text-gray-400 text-sm mb-1">Apellido *</label>
              <input
                type="text"
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="w-full p-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-gray-400 text-sm mb-1">Teléfono</label>
            <div className="flex rounded bg-[#33334F] border border-transparent focus-within:border-orange-500 focus-within:ring-orange-500">
              <span className="flex items-center p-2 text-white border-r border-[#212133]">
                {/* Bandera de Chile y código */}
                <img src="https://flagcdn.com/w20/cl.png" alt="Chile Flag" className="w-5 h-auto mr-1" />
                +56
              </span>
              <input
                type="tel"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono"
                className="flex-1 p-2 bg-transparent text-white placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Correo electrónico */}
          <div>
            <label htmlFor="email" className="block text-gray-400 text-sm mb-1">Correo electrónico</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
          </div>

          {/* Tag del cliente - Botón que abre el modal de tags de cliente */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Tag del cliente</label>
            <button
              type="button"
              onClick={() => setIsClientTagsModalOpen(true)}
              className="w-full text-left px-4 py-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500 flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-2">
                {clientTags.length > 0 ? (
                  clientTags.map(tag => (
                    <span key={tag} className="bg-blue-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Toca para agregar tags</span>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </div>

          {/* Tags de la reserva - Botón que abre el modal de tags de reserva */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Tags de la reserva</label>
            <button
              type="button"
              onClick={() => setIsReservationTagsModalOpen(true)}
              className="w-full text-left px-4 py-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500 flex items-center justify-between"
            >
              <div className="flex flex-wrap gap-2">
                {reservationTags.length > 0 ? (
                  reservationTags.map(tag => (
                    <span key={tag} className="bg-purple-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">Toca para agregar tags</span>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>
          </div>

          {/* # Membresía */}
          <div>
            <label htmlFor="membershipNumber" className="block text-gray-400 text-sm mb-1"># Membresía</label>
            <input
              type="text"
              id="membershipNumber"
              value={membershipNumber}
              onChange={(e) => setMembershipNumber(e.target.value)}
              className="w-full p-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {/* Nota de la reserva */}
          <div>
            <label htmlFor="reservationNote" className="block text-gray-400 text-sm mb-1">Nota de la reserva</label>
            <div className="relative">
              <textarea
                id="reservationNote"
                value={reservationNote}
                onChange={(e) => setReservationNote(e.target.value)}
                placeholder="Escribe una nota"
                rows={3}
                className="w-full pl-10 pr-4 py-2 rounded bg-[#33334F] text-white placeholder-gray-400 border border-transparent focus:border-orange-500 focus:ring-orange-500 resize-none"
              ></textarea>
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
            </div>
          </div>

          {/* Adjuntar archivo */}
          <div className="flex items-center justify-between bg-[#33334F] p-3 rounded">
            <label className="text-gray-400 text-sm cursor-pointer">
              Adjuntar archivo: {selectedFile ? selectedFile.name : 'Ninguno'}
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors cursor-pointer">
              Cargar
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          {/* Este div ya no es necesario aquí si lo mueves al pie del modal */}
        </form>

        {/* Botones de acción del formulario (abajo), siempre visibles */}
        <div className="p-4 border-t border-[#3C2022] flex justify-end space-x-4 bg-[#212133] z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded font-semibold text-white border border-white/20 hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="new-request-form" // Asegúrate de que el form ID coincida
            className="px-6 py-2 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Crear
          </button>
        </div>
      </div>

      {/* Modales de tags */}
      <ClientTagsModal
        isOpen={isClientTagsModalOpen}
        onClose={() => setIsClientTagsModalOpen(false)}
        onSaveTags={(selectedTags) => {
          setClientTags(selectedTags);
          setIsClientTagsModalOpen(false);
        }}
        initialSelectedTags={clientTags}
      />

      <ReservationTagsModal
        isOpen={isReservationTagsModalOpen}
        onClose={() => setIsReservationTagsModalOpen(false)}
        onSaveTags={(selectedTags) => {
          setReservationTags(selectedTags);
          setIsReservationTagsModalOpen(false);
        }}
        initialSelectedTags={reservationTags}
      />
    </div>
  );
};

export default NewRequestModal;