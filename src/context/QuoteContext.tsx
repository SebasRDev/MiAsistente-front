import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

import { QuoteAction, QuoteState } from '@/types/quote';

const STORAGE_KEY = 'quote_state';

const defaultState: QuoteState = {
  segment: 'formula',
  quote: {
    client: '',
    phone: '',
    id: '',
    gift: '',
    profesional: '',
    generalDiscount: 0,
  },
  kit: '',
  products: [],
};

const getInitialState = (): QuoteState => {
  if (typeof window === 'undefined') return defaultState;

  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : defaultState;
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return defaultState;
  }
};

const QuoteContext = createContext<{
  state: QuoteState;
  dispatch: React.Dispatch<QuoteAction>;
} | undefined>(undefined);

function quoteReducer(state: QuoteState, action: QuoteAction): QuoteState {
  let newState: QuoteState;

  switch (action.type) {
    case 'SET_SEGMENT':
      newState = {
        ...defaultState,
        segment: action.payload
      };
      break;

    case 'SET_CLIENT_INFO':
      newState = {
        ...state,
        quote: {
          ...state.quote,
          [action.payload.field]: action.payload.value
        }
      };
      break;

    case 'SET_GENERAL_DISCOUNT':
      newState = {
        ...state,
        quote: {
          ...state.quote,
          generalDiscount: action.payload
        }
      };
      break;

    case 'SET_KIT':
      newState = {
        ...state,
        kit: action.payload
      };
      break;

    case 'ADD_PRODUCT':
      newState = {
        ...state,
        products: [...state.products, action.payload]
      };
      break;

    case 'UPDATE_PRODUCT':
      newState = {
        ...state,
        products: state.products.map((product) => {
          if (action.payload.instanceId && product.instanceId === action.payload.instanceId) {
            return { ...product, ...action.payload.product };
          } else if (!action.payload.instanceId && product.id === action.payload.id) {
            return { ...product, ...action.payload.product };
          }
          return product;
        })
      };
      break;

    case 'REMOVE_PRODUCT':
      if (action.instanceId) {
        newState = {
          ...state,
          products: state.products.filter(product => product.instanceId !== action.instanceId)
        };
      } else {
        newState = {
          ...state,
          products: state.products.filter(product => product.id !== action.payload)
        };
      }
      break;

    case 'RESET_QUOTE':
      newState = {
        ...defaultState,
        segment: state.segment,
      };
      break;

    case 'LOAD_SAVED_STATE':
      newState = action.payload;
      break;

    default:
      return state;
  }

  // Save to localStorage after each state change
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }

  return newState;
}


export function QuoteProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quoteReducer, defaultState);

  useEffect(() => {
    const savedState = getInitialState();
    if (savedState !== defaultState) {
      dispatch({ type: 'LOAD_SAVED_STATE', payload: savedState });
    }
  }, []);

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
}


export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}