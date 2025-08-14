import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker'; 
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId?: number;       
  onReservationCreate?: (reservationData: any) => void;
}

interface HorarioDisponible {
  id: number;
  hora_inicio: string;  // Ejemplo "12:00:00"
  hora_fin: string;     // Ejemplo "12:30:00"
}

const predefinedOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const NewReservationModal: React.FC<NewReservationModalProps> = ({
  isOpen,
  onClose,
  tableId,
  onReservationCreate
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedGuests, setSelectedGuests] = useState<number | null>(null);
  const [customGuests, setCustomGuests] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [currentStep, setCurrentStep] = useState<'date' | 'guests' | 'time' | 'name'>('date');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [notes, setNotes] = useState('');

  const [availableTimes, setAvailableTimes] = useState<HorarioDisponible[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Resetear modal
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(new Date());
      setSelectedGuests(null);
      setCustomGuests('');
      setShowCustomInput(false);
      setCurrentStep('date');
      setSelectedTime(null);
      setGuestName('');
      setGuestLastName('');
      setGuestEmail('');
      setGuestPhone('');
      setNotes('');
      setAvailableTimes([]);
      setErrorMessage('');
    }
  }, [isOpen, tableId]);

  // Consultar horarios
  useEffect(() => {
    if (!selectedDate || !tableId) {
      setAvailableTimes([]);
      setSelectedTime(null);
      return;
    }

    const fetchAvailableTimes = async () => {
      try {
        setLoadingTimes(true);
        const fechaStr = selectedDate.toISOString().split('T')[0];
        const response = await axios.get(`${API_BASE_URL}/api/horarios/horarios-disponibles`, {
          params: { mesa_id: tableId, fecha: fechaStr },
        });
        setAvailableTimes(response.data.horarios);
        setSelectedTime(null);
      } catch (error) {
        console.error(error);
        setAvailableTimes([]);
      } finally {
        setLoadingTimes(false);
      }
    };

    fetchAvailableTimes();
  }, [selectedDate, tableId]);

  const formatTime = (time24: string) => {
    const [hourStr, minute] = time24.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
    return `${hour}:${minute} ${ampm}`;
  };

  const getFormattedDate = (date: Date | null) => {
    if (!date) return 'Selecciona una fecha';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  // Handlers de pasos
  const handleContinue = () => {
    if (currentStep === 'date' && selectedDate) setCurrentStep('guests');
    else if (currentStep === 'guests' && selectedGuests) setCurrentStep('time');
    else if (currentStep === 'time' && selectedTime) setCurrentStep('name');
  };

  const handleBack = () => {
    if (currentStep === 'guests') setCurrentStep('date');
    else if (currentStep === 'time') setCurrentStep('guests');
    else if (currentStep === 'name') setCurrentStep('time');
  };

  const handleCustomGuestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomGuests(value);
    const num = parseInt(value);
    setSelectedGuests(num > 0 ? num : null);
  };

  const handleCreateReservation = async () => {
    setErrorMessage('');

    if (!guestName.trim() || !guestLastName.trim()) {
      setErrorMessage('Nombre y apellido son obligatorios');
      return;
    }
    if (!guestEmail.trim() || !/\S+@\S+\.\S+/.test(guestEmail)) {
      setErrorMessage('Correo electrónico inválido');
      return;
    }
    if (!guestPhone.trim()) {
      setErrorMessage('Teléfono es obligatorio');
      return;
    }
    if (!selectedDate || !selectedGuests || !selectedTime) {
      setErrorMessage('Completa todos los campos obligatorios');
      return;
    }

    const fechaReservaStr = selectedDate.toISOString().split('T')[0];
    const horarioSeleccionado = availableTimes.find(h => formatTime(h.hora_inicio) === selectedTime);

    if (!horarioSeleccionado) {
      setErrorMessage('Selecciona un horario válido');
      return;
    }

    const reservationData = {
      nombre: guestName.trim(),
      apellido: guestLastName.trim(),
      correo_electronico: guestEmail.trim(),
      telefono: guestPhone.trim(),
      mesa_id: tableId ?? null,
      horario_id: horarioSeleccionado.id,
      fecha_reserva: fechaReservaStr,
      cantidad_personas: selectedGuests,
      notas: notes.trim() || null,
    };

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/api/reservas`, reservationData);
      onReservationCreate?.(response.data);
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Nueva Reserva</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-4 md:p-6">
          {/* Steps Navigation */}
          <div className="flex flex-wrap border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
            {['date', 'guests', 'time', 'name'].map((step, idx) => {
              const isActive = currentStep === step;
              const label = step === 'date' ? getFormattedDate(selectedDate)
                          : step === 'guests' ? (selectedGuests ? `${selectedGuests} Invitado${selectedGuests > 1 ? 's' : ''}` : 'Invitados')
                          : step === 'time' ? selectedTime || 'Hora'
                          : 'Nombre y Apellido';
              return (
                <button
                  key={idx}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 border-b-2 whitespace-nowrap ${
                    isActive ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{label}</span>
                </button>
              )
            })}
          </div>

          {/* Step Content */}
          {currentStep === 'date' && (
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Selecciona la fecha</h3>
              <div className="flex justify-center">
                <DatePicker
                  selected={selectedDate}
                  onChange={setSelectedDate}
                  dateFormat="dd/MM/yyyy"
                  inline
                  minDate={new Date()}
                  className="react-datepicker-custom"
                />
              </div>
            </div>
          )}

          {currentStep === 'guests' && (
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Cantidad de comensales</h3>
              <div className="space-y-2">
                {predefinedOptions.map(num => (
                  <button
                    key={num}
                    onClick={() => { setSelectedGuests(num); setShowCustomInput(false); }}
                    className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors ${
                      selectedGuests === num ? 'bg-orange-50 border-orange-300' : ''
                    }`}
                  >
                    {num} Invitado{num > 1 ? 's' : ''}
                  </button>
                ))}
                {showCustomInput ? (
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={customGuests}
                    onChange={handleCustomGuestsChange}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Número personalizado"
                    autoFocus
                  />
                ) : (
                  <button onClick={() => { setShowCustomInput(true); setSelectedGuests(null); }}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors text-orange-600"
                  >
                    Otro número de invitados...
                  </button>
                )}
              </div>
            </div>
          )}

          {currentStep === 'time' && (
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Selecciona la hora</h3>
              {loadingTimes ? <p>Cargando horarios...</p> :
                availableTimes.length === 0 ? <p className="text-gray-500">No hay horarios disponibles</p> :
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {availableTimes.map(time => {
                    const display = formatTime(time.hora_inicio);
                    return (
                      <button
                        key={time.id}
                        onClick={() => setSelectedTime(display)}
                        className={`px-2 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg hover:bg-orange-50 transition-colors text-center ${
                          selectedTime === display ? 'bg-orange-50 border-orange-300 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        {display}
                      </button>
                    )
                  })}
                </div>
              }
            </div>
          )}

          {currentStep === 'name' && (
            <div>
              <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">Información del cliente</h3>
              <div className="space-y-3 sm:space-y-4">
                {['guestName', 'guestLastName', 'guestEmail', 'guestPhone'].map(field => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                      {field === 'guestName' ? 'Nombre *' :
                       field === 'guestLastName' ? 'Apellido *' :
                       field === 'guestEmail' ? 'Correo electrónico *' :
                       'Teléfono *'}
                    </label>
                    <input
                      type={field === 'guestEmail' ? 'email' : 'text'}
                      value={field === 'guestName' ? guestName :
                             field === 'guestLastName' ? guestLastName :
                             field === 'guestEmail' ? guestEmail :
                             guestPhone}
                      onChange={e => field === 'guestName' ? setGuestName(e.target.value) :
                                     field === 'guestLastName' ? setGuestLastName(e.target.value) :
                                     field === 'guestEmail' ? setGuestEmail(e.target.value) :
                                     setGuestPhone(e.target.value)}
                      className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Notas (opcional)</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>
              {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            </div>
          )}

          {/* Navegación */}
          <div className="mt-6 flex justify-between">
            {currentStep !== 'date' && <button onClick={handleBack} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">Atrás</button>}
            {currentStep !== 'name' && <button onClick={handleContinue} disabled={(currentStep === 'date' && !selectedDate) || (currentStep === 'guests' && !selectedGuests) || (currentStep === 'time' && !selectedTime)} className={`ml-auto px-4 py-2 rounded-md transition-colors ${((currentStep === 'date' && selectedDate) || (currentStep === 'guests' && selectedGuests) || (currentStep === 'time' && selectedTime)) ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>Continuar</button>}
            {currentStep === 'name' && <button onClick={handleCreateReservation} disabled={submitting} className="ml-auto px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">{submitting ? 'Creando...' : 'Crear reserva'}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReservationModal;
