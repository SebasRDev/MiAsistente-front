import { DocumentData } from 'firebase/firestore';

export interface Product {
  id: string;
  instanceId?: string;
  code: string;
  name: string;
  publicPrice?: number | null;
  efficiency?: number | null;
  profesionalPrice: number;
  actives: string;
  properties: string[];
  phase: string;
  time: string;
  image?: string | null;
  discount: number;
  quantity: number;
}

export interface QuoteState {
  segment: 'formula' | 'quote';
  quote: {
    client: string;
    phone: string;
    id: string;
    gift: string;
    profesional: string;
    generalDiscount: number;
    recommendations?: string;
  };
  kit: string;
  products: Product[];
  user: DocumentData | undefined;
}

export type QuoteAction =
  | { type: 'SET_SEGMENT'; payload: 'formula' | 'quote' }
  | {
      type: 'SET_CLIENT_INFO';
      payload: {
        field:
          | 'client'
          | 'phone'
          | 'id'
          | 'gift'
          | 'profesional'
          | 'recommendations';
        value: string;
      };
    }
  | { type: 'SET_GENERAL_DISCOUNT'; payload: number }
  | { type: 'SET_KIT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | {
      type: 'UPDATE_PRODUCT';
      payload: { id: string; instanceId?: string; product: Partial<Product> };
    }
  | { type: 'REMOVE_PRODUCT'; instanceId?: string; payload: string }
  | { type: 'RESET_QUOTE' }
  | { type: 'LOAD_SAVED_STATE'; payload: QuoteState }
  | { type: 'SET_USER'; payload: DocumentData | undefined }
  | { type: 'CLEAR_USER' };
