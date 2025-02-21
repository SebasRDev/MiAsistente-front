/* eslint-disable react/no-children-prop */
'use client';

import { getQueryClient } from "@/app/get-query-client";
import { QuoteProvider } from "@/context/QuoteContext";
import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const queryClient = getQueryClient();

  return (
    <HeroUIProvider
      locale="es-ES"
      reducedMotion="user"
      children={undefined}
    >
      <QuoteProvider children={undefined}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </QuoteProvider>
    </HeroUIProvider>
  );
}