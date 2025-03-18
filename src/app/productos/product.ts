import { queryOptions } from '@tanstack/react-query';

export const productOptions = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/products`
    );
    const data = await response.json();
    console.log(data);
    return data;
  },
});
