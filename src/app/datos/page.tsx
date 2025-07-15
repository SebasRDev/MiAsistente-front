'use client'
import { Input, Textarea } from "@heroui/react";
import { useEffect } from "react";

import { useQuote } from "@/context/QuoteContext";

export type FieldName = 'client' | 'phone' | 'id' | 'gift' | 'profesional' | 'recommendations' | 'campaign' | 'city';

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
    label: "Campaña",
    name: 'campaign',
    type: 'text',
    segment: 'quote'
  },
  {
    label: "Ciudad",
    name: 'city',
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

  const handleChange = (value: string, field: FieldName) => {
    dispatch({
      type: 'SET_CLIENT_INFO',
      payload: { field, value }
    });
  }

  const setLabel = (name: string, label: string) => {
    if (name === 'profesional' && state.segment === 'formula') return label
    if (name === 'profesional' && state.segment === 'quote') return 'Asesor SkinHealth'
    if (name === 'campaign') return 'Campaña'
    return state.segment === 'formula' ? `${label} paciente` : `${label} cliente`
  }

  return (
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
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
    </div>
  )
}