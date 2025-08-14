// types.ts
export interface WaitingListData {
  fecha_reserva: string; // o Date, según prefieras
  invitados: number;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
  membership_id?: string;
  client_tags?: string[];
  reservation_tags?: string[];
  notas?: string;
}
