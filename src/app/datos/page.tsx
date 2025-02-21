'use client'
import { useQuote } from "@/context/QuoteContext";
import { Input, Tabs, Tab } from "@heroui/react";
import { IconPercentage } from '@tabler/icons-react';


const fields = [
  {
    label: "Nombre del paciente",
    name: 'client',
    type: 'text'
  },
  {
    label: "Télefono paciente",
    name: 'phone',
    type: 'tel'
  },
  {
    label: "Nit/CC paciente",
    name: 'id',
    type: 'tel'
  },
  {
    label: "Fidelizador para el paciente",
    name: 'gift',
    type: 'text'
  },
  {
    label: "Profesional de la estética",
    name: 'profesional',
    type: 'text'
  },
]

export default function Datos() {
  const { state, dispatch } = useQuote();

  const handleChange = (value: string, field: 'client' | 'phone' | 'id' | 'gift' | 'profesional') => {
    dispatch({
      type: 'SET_CLIENT_INFO',
      payload: { field, value }
    });
  }

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
    <div className="container max-w-6xl w-11/12 mx-auto py-7">
      <Tabs aria-label="Opciones" radius="full" className="w-full justify-center">
        <Tab key="datos" title="Datos del cliente">
          <h1 className="font-Trajan-pro text-primary text-center text-2xl">Datos del {state.segment === 'formula' ? 'paciente' : 'cliente'}</h1>
          <div className="flex flex-col gap-4">
            {fields.map(({ label, type, name }) => <Input
              key={label} type={type}
              label={label}
              name={name}
              value={state.quote[name] ?? ''}
              onChange={(e) => handleChange(e.target.value, name)}
            />)}
          </div>
        </Tab>
        <Tab key="descuento-general" title="Descuento General">
          <h2 className="font-Trajan-pro text-primary text-center text-2xl">Descuento General</h2>
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
        </Tab>
      </Tabs>
      <div className="flex flex-col gap-4">
      </div>
    </div>
  )
}