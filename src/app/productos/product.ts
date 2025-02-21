import { queryOptions } from '@tanstack/react-query';

export const productOptions = queryOptions({
  queryKey: ['products'],
  queryFn: async () => {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    return data;
  },
});
