'use client';

import { HeroUIProvider } from "@heroui/react";
import { type ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: AppProviderProps) {
  return (
    <HeroUIProvider
      locale="es-ES"
      reducedMotion="user"
    >
      {children}
    </HeroUIProvider>
  );
}