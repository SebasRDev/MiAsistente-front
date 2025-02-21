import { queryOptions } from '@tanstack/react-query';

export const kitsOptions = queryOptions({
  queryKey: ['kits'],
  queryFn: async () => {
    const response = await fetch('http://localhost:3000/api/kits');
    const data = await response.json();
    return data;
  },
});
