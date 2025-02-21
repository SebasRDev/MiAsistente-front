'use client'

import { productOptions } from "@/app/productos/product"
import ProductFormulaCards from "@/components/common/cards/productFormulaCards"
import ProductQuoteCards from "@/components/common/cards/productQuoteCards"
import { CheckIcon } from "@/components/common/icons/icons"
import { useQuote } from "@/context/QuoteContext"
import { Product } from "@/types/quote"
import { Autocomplete, AutocompleteItem } from "@heroui/react"
import { useSuspenseQuery } from "@tanstack/react-query"

const Products = () => {
  const { state, dispatch } = useQuote();
  const { data } = useSuspenseQuery(productOptions);
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
        }}
      >
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
            <ProductFormulaCards key={product.id} product={product} />
          ))
        }
        {state.segment === 'quote' &&
          state.products.map(product => (
            <ProductQuoteCards key={product.id} product={product} />
          ))
        }
      </div>
    </>
  )
}

export default Products