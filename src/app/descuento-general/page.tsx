'use client'
import { Input } from "@heroui/react";
import { IconPercentage } from '@tabler/icons-react';

import { useQuote } from "@/context/QuoteContext";


export default function Datos() {
  const { state, dispatch } = useQuote();

  const handleDiscount = (value: number) => {
    if (isNaN(value)) {
      return
    }
    if (value > 100) {
      dispatch({ type: 'SET_GENERAL_DISCOUNT', payload: 100 })
      return
    }
    dispatch({ type: 'SET_GENERAL_DISCOUNT', payload: Number(value) })
  }

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
      <h1 className="font-Trajan-pro-bold text-primary text-center text-2xl">Descuento General</h1>
      <Input
        type="tel"
        label="Descuento General"
        endContent={
          <div className="pointer-events-none flex items-center">
            <IconPercentage />
          </div>
        }
        value={state.quote.generalDiscount.toString()}
        onChange={(e) => handleDiscount(Number(e.target.value))}
      />
    </div>
  )
}