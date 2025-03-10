'use client'

import { useQuote } from '@/context/QuoteContext';
import { calculateSummaryTotals, currencyFormatter } from '../../utils/product';
export default function Datos() {
  const { state } = useQuote();
  const { totalToPay, totalNoDiscount, genDiscount, totalProductsQtty, totalPublic, profit, profitability, averageEfficiency } = state.segment === 'formula' ? calculateSummaryTotals(state.products, 'publicPrice') : calculateSummaryTotals(state.products, 'profesionalPrice');

  let fields;
  switch (state.segment) {
    case 'formula':
      fields = [
        {
          label: "Total a pagar:",
          value: currencyFormatter.format(totalToPay)
        },
        {
          label: "Total sin descuento:",
          value: currencyFormatter.format(totalNoDiscount)
        },
        {
          label: "Cantidad Total de productos:",
          value: totalProductsQtty
        },
        {
          label: "Descuento general:",
          value: genDiscount.toFixed(2)
        }
      ]
      break;
    case 'quote':
      fields = [
        {
          label: "Total a pagar:",
          value: currencyFormatter.format(totalToPay)
        },
        {
          label: "Total sin descuento:",
          value: currencyFormatter.format(totalNoDiscount)
        },
        {
          label: "Venta Público:",
          value: currencyFormatter.format(totalPublic)
        },
        {
          label: "Ganancia:",
          value: profit
        },
        {
          label: "Rentabilidad:",
          value: profitability.toFixed(2)
        },
        {
          label: "Rendimiento Promedio:",
          value: averageEfficiency.toFixed(2)
        },
        {
          label: "Cantidad Total de productos:",
          value: totalProductsQtty
        },
        {
          label: "Descuento general:",
          value: genDiscount.toFixed(2)
        }
      ]
      break;
    default:
      return <></>
  }

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
      <h1 className="font-Trajan-pro text-primary text-center text-2xl">Resumen General</h1>
      <div className="flex flex-col gap-4">
        {fields.map(({ label, value }) => <p key={label}>{label} <span className="font-bold">{value}</span></p>)}
      </div>
    </div>
  )
}