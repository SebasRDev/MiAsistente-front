'use client'

import { useQuery } from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import { productOptions } from "@/app/productos/product"
import { useQuote } from "@/context/QuoteContext"
import { Product } from "@/types/quote"

// Campos de catálogo que se refrescan en los productos ya agregados a la
// cotización/fórmula. quantity, discount e instanceId son propios de esa
// línea de cotización y nunca se tocan aquí.
const CATALOG_FIELDS = [
  'code', 'name', 'publicPrice', 'efficiency', 'profesionalPrice',
  'actives', 'properties', 'phase', 'time', 'image',
] as const;

function hasCatalogChanges(item: Product, live: Product): boolean {
  return CATALOG_FIELDS.some((field) => {
    if (field === 'properties') {
      return JSON.stringify(item.properties) !== JSON.stringify(live.properties);
    }
    return item[field] !== live[field];
  });
}

// Componente sin UI: reconcilia los productos guardados en localStorage
// (potencialmente viejos, restaurados para no perder la cotización en un
// refresh) contra el catálogo vivo, reusando la misma query que ya usa el
// buscador de productos (sin peticiones extra) y solo cuando hay productos
// que reconciliar.
export default function ProductCatalogSync() {
  const { state, dispatch } = useQuote();
  const hasSavedProducts = state.products.length > 0;
  const { data } = useQuery({ ...productOptions, enabled: hasSavedProducts });

  const productsRef = useRef(state.products);
  productsRef.current = state.products;

  useEffect(() => {
    if (!data) return;

    const catalogById = new Map<string, Product>(
      data.map((product: Product) => [product.id, product])
    );

    productsRef.current.forEach((item) => {
      const live = catalogById.get(item.id);

      if (!live) {
        dispatch({ type: 'REMOVE_PRODUCT', instanceId: item.instanceId, payload: item.id });
        toast.warning(`"${item.name}" ya no está disponible y se quitó de tu cotización.`);
        return;
      }

      if (hasCatalogChanges(item, live)) {
        dispatch({
          type: 'UPDATE_PRODUCT',
          payload: {
            id: item.id,
            instanceId: item.instanceId,
            product: {
              code: live.code,
              name: live.name,
              publicPrice: live.publicPrice,
              efficiency: live.efficiency,
              profesionalPrice: live.profesionalPrice,
              actives: live.actives,
              properties: live.properties,
              phase: live.phase,
              time: live.time,
              image: live.image,
            },
          },
        });
      }
    });
  }, [data, dispatch]);

  return null;
}
