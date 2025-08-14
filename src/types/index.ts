// src/types/index.ts

/**
 * @interface Client
 * @description Define la estructura de un objeto cliente para la aplicación.
 */
export interface Client {
  id: string; // Identificador único del cliente
  name: string; // Nombre completo del cliente
  phone: string; // Número de teléfono del cliente (puede incluir código de país)
  email: string; // Correo electrónico del cliente
  visits: number; // Número total de visitas registradas
  lastVisit: string; // Fecha de la última visita (como string para simplicidad sin backend)
  tags: string[]; // Array de strings para los tags del cliente (ej. 'VIP', 'Vegano')
  totalSpent: number; // Cantidad total gastada por el cliente
  spentPerVisit: number; // Gasto promedio por visita
  profileNote: string; // Nota o comentario sobre el perfil del cliente
}