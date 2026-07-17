import { queryOptions } from '@tanstack/react-query';

import { Kit } from '@/app/kits/kit.interface';

export const kitsOptions = queryOptions({
  queryKey: ['kits'],
  queryFn: async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/kits`
    );
    const data = await response.json();
    const orderedData = data.sort((a: Kit, b: Kit) => a.weight - b.weight);
    return orderedData;
  },
  staleTime: 3 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnMount: 'always',
  refetchInterval: 2 * 60 * 1000,
  refetchIntervalInBackground: false,
});
