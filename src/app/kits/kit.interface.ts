export interface Kit {
  id: string;
  name: string;
  price: number;
  tips: string[];
  protocol: Protocol;
  kitProducts: KitProduct[];
}

export interface KitProduct {
  id: string;
  quantity: number;
  product: Product;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  publicPrice: number;
  efficiency: null;
  profesionalPrice: number;
  actives: string;
  properties: string[];
  phase: Phase;
  time: Time;
}

export enum Phase {
  Limpieza = 'LIMPIEZA',
  NutriciónEHidrtatción = 'NUTRICIÓN E HIDRTATCIÓN',
  PhaseTRATAMIENTO = 'TRATAMIENTO ',
  Primer = 'PRIMER',
  Protección = 'PROTECCIÓN',
  Tratamiento = 'TRATAMIENTO',
  TónicoVitalizante = 'TÓNICO VITALIZANTE',
}

export enum Time {
  Dia = 'DIA',
  DiaONoche = 'DIA O NOCHE',
  Día = 'DÍA',
  DíaONoche = 'DÍA O NOCHE',
  Noche = 'NOCHE',
}

export interface Protocol {
  dia: string[];
  noche: string[];
}
