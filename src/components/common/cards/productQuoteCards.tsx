'use client'

import { useQuote } from "@/context/QuoteContext"
import { Product } from "@/types/quote"
import { getProductPrice } from "@/utils/product"
import { Button, Card, CardBody, CardFooter, CardHeader, Input } from "@heroui/react"
import NumberFlow from "@number-flow/react"
import { IconMinus, IconPercentage, IconPlus, IconTrash } from "@tabler/icons-react"
import { useState } from "react"

interface ProductQuoteCardProps {
  key?: string
  product: Product
}

export default function ProductQuoteCards({ product }: ProductQuoteCardProps) {
  const { dispatch } = useQuote();

  const [productState, setProductState] = useState({
    quantity: product.quantity,
    discount: product.discount,
  })

  const handleQuantity = (value: number) => {
    const newVal = productState.quantity + value
    setProductState({ ...productState, quantity: newVal })
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: product.id, product: { quantity: newVal } } })
  }

  const handleDiscount = (value: number) => {
    if (isNaN(value)) {
      return
    }
    if (value > 100) {
      setProductState({ ...productState, discount: 100 })
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id: product.id, product: { discount: 100 } } })
      return
    }
    setProductState({ ...productState, discount: value })
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id: product.id, product: { discount: value } } })
  }

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_PRODUCT', payload: product.id })
  }

  return <Card className="w-full" key={product.code}>
    <CardHeader className="flex gap-2">
      <span className="font-bold text-primary">{product.code}</span>
      {`${product.name}`}
    </CardHeader>
    <CardBody className="flex-row gap-10">
      <div>
        <h4 className="text-lg font-bold">{product.publicPrice === null && 'Rendimiento'}</h4>
        <div className="flex gap-2 items-center">
          <NumberFlow
            value={getProductPrice(product.publicPrice ?? 0, productState.quantity, 0)}
            format={{
              style: 'currency',
              currency: 'COP',
              currencyDisplay: 'narrowSymbol',
              trailingZeroDisplay: 'stripIfInteger'
            }}
            className="text-success-700"
          />
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold">Profesional</h4>
        <div className="flex gap-2 items-center">
          <NumberFlow
            value={getProductPrice(product.profesionalPrice, productState.quantity, 0)}
            format={{
              style: 'currency',
              currency: 'COP',
              currencyDisplay: 'narrowSymbol',
              trailingZeroDisplay: 'stripIfInteger'
            }}
            className="text-success-700"
          />
          {productState.discount > 0 && (
            <NumberFlow
              value={getProductPrice(product.profesionalPrice, productState.quantity, productState.discount)}
              format={{
                style: 'currency',
                currency: 'COP',
                currencyDisplay: 'narrowSymbol',
                trailingZeroDisplay: 'stripIfInteger'
              }}
              className='text-xl'
            />
          )}
        </div>
      </div>
    </CardBody>
    <CardFooter className="flex items-center gap-4">
      <Input
        label="Desc"
        labelPlacement="inside"
        endContent={
          <div className="pointer-events-none flex items-center">
            <IconPercentage />
          </div>
        }
        type="tel"
        value={productState.discount.toString()}
        onChange={(e) => handleDiscount(Number(e.target.value))}
        variant="flat"
        className="w-[25%]"
      />
      <div className="flex gap-2 items-center">
        <Button
          isIconOnly
          variant="light"
          color="primary"
          size="sm"
          onPress={() => handleQuantity(-1)}
          isDisabled={productState.quantity === 1}
        >
          <IconMinus />
        </Button>
        <NumberFlow value={productState.quantity} />
        <Button isIconOnly variant="light" color="primary" size="sm" onPress={() => handleQuantity(1)}>
          <IconPlus />
        </Button>
      </div>
      <Button
        isIconOnly
        color="danger"
        size="sm"
        onPress={() => handleRemove()}
      >
        <IconTrash />
      </Button>
    </CardFooter>
  </Card>;
}