import { queryOptions } from '@tanstack/react-query';

export const kitsOptions = queryOptions({
  queryKey: ['kits'],
  queryFn: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/kits`
    );
    const data = await response.json();
    return data;
  },
});
