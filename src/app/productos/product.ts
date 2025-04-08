import { queryOptions } from '@tanstack/react-query';

export const productOptions = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/products`
    );
    const data = await response.json();
    return data;
  },
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
});
