import emailjs from '@emailjs/browser';

// Configuración de EmailJS desde variables de entorno
const EMAILJS_CONFIG = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateRestaurante: import.meta.env.VITE_EMAILJS_TEMPLATE_RESTAURANTE,
  templateCliente: import.meta.env.VITE_EMAILJS_TEMPLATE_CLIENTE,
};

// Validar que existan las variables de entorno
if (!EMAILJS_CONFIG.publicKey) {
  console.warn('⚠️ VITE_EMAILJS_PUBLIC_KEY no está configurada');
}

// Inicializar EmailJS una sola vez
if (EMAILJS_CONFIG.publicKey) {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

/**
 * Envía un email con reintentos automáticos
 * @param templateId - ID del template de EmailJS
 * @param templateParams - Parámetros del template
 * @param maxRetries - Número máximo de reintentos (default: 3)
 * @param retryDelay - Delay entre reintentos en ms (default: 2000)
 */
export async function sendEmailWithRetry(
  templateId: string,
  templateParams: Record<string, any>,
  maxRetries: number = 3,
  retryDelay: number = 2000
): Promise<void> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        templateId,
        templateParams,
        EMAILJS_CONFIG.publicKey
      );
      
      console.log(`✅ Email enviado exitosamente (intento ${attempt}/${maxRetries})`);
      return; // Éxito, salir de la función
      
    } catch (error) {
      lastError = error;
      console.warn(`❌ Error enviando email (intento ${attempt}/${maxRetries}):`, error);
      
      // Si no es el último intento, esperar antes de reintentar
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  // Si llegamos aquí, todos los intentos fallaron
  throw new Error(`Failed to send email after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`);
}

export { EMAILJS_CONFIG };
export default emailjs;