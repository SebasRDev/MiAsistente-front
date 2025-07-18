interface Product {
  id: string;
  weight: number;
  category: string | null;
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

export default Product;
