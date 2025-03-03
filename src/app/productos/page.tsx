import { getQueryClient } from "@/app/get-query-client";
import { productOptions } from "@/app/productos/product";
import Products from "@/components/common/products/products";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export default async function Productos() {
  const queryClient = getQueryClient()

  void queryClient.prefetchQuery(productOptions)

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Products />
      </HydrationBoundary>
    </div>
  );
}