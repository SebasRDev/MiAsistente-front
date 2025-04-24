'use client'
import { Input, Tabs, Tab, Textarea } from "@heroui/react";
import { IconPercentage } from '@tabler/icons-react';

import { useQuote } from "@/context/QuoteContext";
import { useEffect } from "react";

type FieldName = 'client' | 'phone' | 'id' | 'gift' | 'profesional' | 'recommendations';

interface Field {
  label: string;
  name: FieldName;
  type: string;
  segment: 'all' | 'formula' | 'quote';
}

const fields: Field[] = [
  {
    label: "Nombre del ",
    name: 'client',
    type: 'text',
    segment: 'all'
  },
  {
    label: "Télefono ",
    name: 'phone',
    type: 'tel',
    segment: 'all'
  },
  {
    label: "Nit/CC ",
    name: 'id',
    type: 'tel',
    segment: 'all'
  },
  {
    label: "Cortesía para el",
    name: 'gift',
    type: 'text',
    segment: 'quote'
  },
  {
    label: "Profesional de la estética",
    name: 'profesional',
    type: 'text',
    segment: 'all'
  },
]

export default function Datos() {
  const { state, dispatch } = useQuote();

  useEffect(() => {
    if (state.user) {
      const fullName = `${state.user.name} ${state.user.lastName}`.trim();
      if (fullName && (!state.quote.profesional || state.quote.profesional === '')) {
        dispatch({
          type: 'SET_CLIENT_INFO',
          payload: { field: 'profesional', value: fullName }
        });
      }
    }
  }, [state.user, state.segment]);

  const handleChange = (value: string, field: 'client' | 'phone' | 'id' | 'gift' | 'profesional' | 'recommendations') => {
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

  const setLabel = (name: string, label: string) => {
    if (name === 'profesional' && state.segment === 'formula') return label
    if (name === 'profesional' && state.segment === 'quote') return 'Asesor SkinHealth'
    return state.segment === 'formula' ? `${label} paciente` : `${label} cliente`
  }

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
      <Tabs aria-label="Opciones" radius="full" className="w-full justify-center">
        <Tab key="datos" title="Datos del cliente">
          <h1 className="font-Trajan-pro-bold text-primary text-center text-2xl">Datos del {state.segment === 'formula' ? 'paciente' : 'cliente'}</h1>
          <div className="flex flex-col gap-4">
            {fields.map(({ label, type, name, segment }) => (
              <div key={name} className={segment === 'all' || segment === state.segment ? 'block' : 'hidden'}>
                {type !== 'textarea' ? (
                  <Input
                    type={type}
                    label={setLabel(name, label)}
                    name={name}
                    value={state.quote[name] ?? ''}
                    onChange={(e) => handleChange(e.target.value, name)}
                  />
                ) : (
                  <Textarea
                    label={label}
                    name={name}
                    value={state.quote[name] ?? ''}
                    onChange={(e) => handleChange(e.target.value, name)}
                  />
                )}
              </div>
            ))}
          </div>
        </Tab>
        <Tab key="descuento-general" title="Descuento General">
          <h2 className="font-Trajan-pro-bold text-primary text-center text-2xl">Descuento General</h2>
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