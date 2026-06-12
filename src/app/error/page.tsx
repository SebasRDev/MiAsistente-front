'use client'

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function ErrorPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <h1 className="text-2xl font-bold text-foreground">Algo salió mal</h1>
      <p className="text-default-500 max-w-sm">
        Ocurrió un error inesperado. Por favor intenta nuevamente o regresa al inicio.
      </p>
      <div className="flex gap-3">
        <Button color="primary" variant="solid" onPress={() => router.push('/productos')}>
          Ir al inicio
        </Button>
        <Button color="default" variant="bordered" onPress={() => router.back()}>
          Volver
        </Button>
      </div>
    </div>
  );
}
