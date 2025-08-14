// types.ts
export interface Table {
  id: number;
  shape: 'round' | 'square' | 'rectangular';
  size: 'small' | 'medium' | 'large';
  // ... resto de propiedades
}

export interface Salon {
  id: string;
  name: string;
  tables: Table[];
}