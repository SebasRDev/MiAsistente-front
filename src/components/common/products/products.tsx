/* eslint-disable react/no-children-prop */
'use client'

import { Autocomplete, AutocompleteItem, Drawer, DrawerBody, DrawerContent, DrawerHeader } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useWindowSize } from "@uidotdev/usehooks"
import { useState } from "react"

import { productOptions } from "@/app/productos/product"
import ProductFormulaCards from "@/components/common/cards/productFormulaCards"
import ProductQuoteCards from "@/components/common/cards/productQuoteCards"
import { CheckIcon } from "@/components/common/icons/icons"
import { useQuote } from "@/context/QuoteContext"
import { Product } from "@/types/quote"

const Products = () => {
  const { state, dispatch } = useQuote();
  const { data } = useSuspenseQuery(productOptions);
  const [bondades, setBondades] = useState<Product | null>(null);
  const size = useWindowSize();
  const filteredData = state.segment === 'formula' ? data.filter((product: Product) => product.publicPrice !== null) : data;

  const isProductSelected = (product: Product) => {
    return state.products.some(p => p.id === product.id);
  }

  const handleSelect = (product: Product) => {
    if (!isProductSelected(product)) {
      dispatch({
        type: 'ADD_PRODUCT', payload: {
          ...product,
          quantity: 1,
          discount: 0
        }
      })
    } else {
      dispatch({ type: 'REMOVE_PRODUCT', payload: product.id })
    }
  }

  return (
    <>
      <Autocomplete
        className="w-full"
        label="Buscar productos"
        variant="bordered"
        selectedKey=""
        listboxProps={{
          emptyContent: "No se encontraron productos",
        }} children={null}      >
        {filteredData?.map((product: Product) => (
          <AutocompleteItem
            key={product.code}
            textValue={`${product.code} - ${product.name}`}
            onPress={() => handleSelect(product)}
            endContent={
              isProductSelected(product) && (<CheckIcon />)
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
            <ProductFormulaCards key={product.id} product={product} handleBondades={setBondades} />
          ))
        }
        {state.segment === 'quote' &&
          state.products.map(product => (
            <ProductQuoteCards key={product.id} product={product} />
          ))
        }
        <Drawer size="lg" backdrop="blur" isOpen={bondades !== null} placement={(size?.width || 0) > 768 ? 'right' : 'bottom'} onClose={() => setBondades(null)} children={undefined} hideCloseButton>
          <DrawerContent children={undefined}>
            <DrawerHeader className="px-8" children={undefined}>
              <h1 className="font-Trajan-pro-bold text-primary text-center text-2xl px-4 text-balance">{bondades?.name}</h1>
            </DrawerHeader>
            <DrawerBody children={undefined}>
              <div className="flex flex-col gap-4 pb-10">
                <p>Fase de tratamiento: <span className="font-bold">{bondades?.phase}</span></p>
                <p>Horario de uso: <span className="font-bold">{bondades?.time}</span></p>
                <p className="flex flex-col">Activos: <span className="font-bold">{bondades?.actives}</span></p>
                <p className="font-bold">Caracteristicas:</p>
                <ul>
                  {bondades?.properties.map((property: string, index: number) => (
                    <li key={index} className="flex gap-2"><span className="font-bold">{index + 1}. </span>{property}</li>
                  ))}
                </ul>
              </div>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

export default Products