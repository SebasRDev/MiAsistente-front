import { queryOptions } from '@tanstack/react-query';

import Product from '@/app/productos/product.interface';

export const productOptions = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/products`
    );
    const data = await response.json();
    const orderedData = data.sort(
      (a: Product, b: Product) => a.weight - b.weight
    );
    return orderedData;
  },
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
});
