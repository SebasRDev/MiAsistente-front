import { getQueryClient } from "@/app/get-query-client";
import { kitsOptions } from "@/app/kits/kits";
import Kits from "@/components/common/kits/kits";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Productos() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(kitsOptions)

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Kits />
      </HydrationBoundary>
    </div>
  );
}