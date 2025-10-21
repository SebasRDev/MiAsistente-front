
'use client';

import { HeroUIProvider } from "@heroui/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { PropsWithChildren } from 'react';

import { getQueryClient } from "@/app/get-query-client";
import { AuthProvider } from "@/context/AuthContext";
import { QuoteProvider } from "@/context/QuoteContext";

export function Providers({ children }: PropsWithChildren) {
  const queryClient = getQueryClient();

  return (
    <HeroUIProvider
      locale="es-ES"
      reducedMotion="user"
    >
      <AuthProvider>
        <QuoteProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </QuoteProvider>
      </AuthProvider>
    </HeroUIProvider>
  );
}