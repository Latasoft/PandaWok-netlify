import emailjs from '@emailjs/browser';

// Configuración de EmailJS desde variables de entorno
const EMAILJS_CONFIG = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateGrupo: import.meta.env.VITE_EMAILJS_TEMPLATE_GRUPO,
  templateConfirmacion: import.meta.env.VITE_EMAILJS_TEMPLATE_CONFIRMACION,
};

// Validar que existan las variables de entorno
if (!EMAILJS_CONFIG.publicKey) {
  console.warn('⚠️ VITE_EMAILJS_PUBLIC_KEY no está configurada');
}

// Inicializar EmailJS una sola vez
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

export { EMAILJS_CONFIG };
export default emailjs;