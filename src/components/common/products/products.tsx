'use client'

import { Autocomplete, AutocompleteItem, Drawer, DrawerBody, DrawerContent, DrawerHeader, Textarea } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useWindowSize } from "@uidotdev/usehooks"
import { motion } from 'framer-motion';
import { useRef, useState } from "react"

import { productOptions } from "@/app/productos/product"
import ProductFormulaCards from "@/components/common/cards/productFormulaCards"
import ProductQuoteCards from "@/components/common/cards/productQuoteCards"
import { useQuote } from "@/context/QuoteContext"
import { Product } from "@/types/quote"


const Products = () => {
  const { state, dispatch } = useQuote();
  const { data } = useSuspenseQuery(productOptions);
  const [bondades, setBondades] = useState<Product | null>(null);
  const autocompleteRef = useRef<HTMLInputElement>(null);
  const size = useWindowSize();
  const filteredData = state.segment === 'formula' ? data.filter((product: Product) => product.publicPrice !== null) : data;

  const getProductCount = (productId: string) => {
    return state.products.filter(p => p.id === productId).length;
  }

  const handleSelect = (product: Product) => {
    dispatch({
      type: 'ADD_PRODUCT', payload: {
        ...product,
        quantity: 1,
        discount: 0,
        instanceId: `${product.id}_${Date.now()}`
      }
    })
    if (autocompleteRef.current) {
      // Programáticamente cerrar el popover
      (document.activeElement as HTMLElement)?.blur();
    }
  }

  return (
    <>
      <Autocomplete
        ref={autocompleteRef}
        className="w-full"
        label="Buscar productos"
        variant="bordered"
        selectedKey=""
        listboxProps={{
          emptyContent: "No se encontraron productos",
        }}>
        {filteredData?.map((product: Product) => (
          <AutocompleteItem
            key={product.code}
            textValue={`${product.code} - ${product.name}`}
            onPress={() => handleSelect(product)}
            endContent={
              getProductCount(product.id) > 0 ? (
                <span className="text-primary font-bold">
                  {getProductCount(product.id)}
                </span>) : null
            }
          >
            <span className="font-bold text-primary-900 text-xs">{product.code}</span>
            {`-${product.name}`}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      <div className="flex flex-col-reverse gap-4 mt-2">
        {state.segment === 'formula' &&
          state.products.map(product => (
            <ProductFormulaCards key={product.instanceId} product={product} handleBondades={setBondades} />
          ))
        }
        {state.segment === 'quote' &&
          state.products.map(product => (
            <ProductQuoteCards key={product.instanceId} product={product} />
          ))
        }
        <Drawer size={(size?.width || 0) > 768 ? 'lg' : 'xl'} backdrop="blur" isOpen={bondades !== null} placement={(size?.width || 0) > 768 ? 'right' : 'bottom'} onClose={() => setBondades(null)} hideCloseButton>
          <DrawerContent>
            <DrawerHeader
              className="px-8 bg-primary justify-center"
            >
              <h1 className="font-Trajan-pro-bold drop-shadow-[0_0_4px_#f7ede4] text-cream text-center text-2xl px-4 text-balance">{bondades?.name}</h1>
            </DrawerHeader>
            <DrawerBody className="bg-cream">
              <div className="flex justify-end relative">
                {bondades?.image &&
                  <div className="w-[65%] flex-shrink-0 block">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      src={bondades?.image}
                      alt={bondades?.name}
                    />
                  </div>
                }
                <motion.div
                  className="flex flex-col gap-4 pb-10 pt-10 flex-shrink-0 max-w-[35%]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <p>Fase de tratamiento: <span className="font-bold">{bondades?.phase}</span></p>
                  <p>Horario de uso: <span className="font-bold">{bondades?.time}</span></p>
                  <p className="flex flex-col">Activos: <span className="font-bold">{bondades?.actives}</span></p>
                </motion.div>
              </div>
              <div className="flex flex-col gap-4 pb-10">
                <p className="font-bold">Caracteristicas:</p>
                <ul>
                  {bondades?.properties.map((property: string, index: number) => (
                    <motion.li
                      key={index}
                      className="flex gap-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3, delay: 0.2 * index }}
                    >
                      <span className="font-bold">{index + 1}. </span>{property}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
      <Textarea
        className="mt-4"
        label={state.segment === 'formula' ? 'Recomendaciones Profesional de la Estética: ' : 'Observaciones'}
        name="recommendations"
        value={state.quote.recommendations}
        onChange={(e) => dispatch({ type: 'SET_CLIENT_INFO', payload: { field: 'recommendations', value: e.target.value } })}
      />
    </>
  )
}

export default Products