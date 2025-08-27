'use client'
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function WaitingRoom() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Función para verificar el estado del usuario
  const checkUserStatus = useCallback(async () => {
    if (!user || isChecking) return;

    setIsChecking(true);
    try {
      // Recargar los datos del usuario desde Clerk
      await user.reload();
      
      const userRole = user.publicMetadata.role as string;
      const userStatus = user.publicMetadata.status as string;
      const approved = user.publicMetadata.approved as boolean;
      
      console.log('Estado actual:', { userRole, userStatus, approved });
      
      // Si el usuario ya fue aprobado, redirigir
      if (userStatus === 'active' && approved === true) {
        router.push('/productos');
        return;
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error('Error verificando estado del usuario:', error);
    } finally {
      setIsChecking(false);
    }
  }, [user, router, isChecking]);

  // Verificación inicial cuando se carga el componente
  useEffect(() => {
    if (isLoaded && user) {
      const userRole = user.publicMetadata.role as string;
      const userStatus = user.publicMetadata.status as string;
      const approved = user.publicMetadata.approved as boolean;
      
      // Si el usuario ya fue aprobado, redirigir inmediatamente
      if ((userRole === 'user' || userRole === 'profesional') && 
          (userStatus === 'active' || approved === true)) {
        router.push('/productos');
        return;
      }
    }
  }, [user, isLoaded, router]);

  // Polling cada 5 segundos para verificar cambios
  useEffect(() => {
    if (!isLoaded || !user) return;

    const interval = setInterval(() => {
      checkUserStatus();
    }, 5000); // Verifica cada 5 segundos

    // Limpiar el intervalo cuando el componente se desmonte
    return () => clearInterval(interval);
  }, [isLoaded, user, checkUserStatus]);

  // Verificar cuando la ventana vuelve a tener foco
  useEffect(() => {
    const handleFocus = () => {
      if (isLoaded && user) {
        checkUserStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isLoaded, user, checkUserStatus]);

  // Verificar cuando se hace clic en la página
  useEffect(() => {
    const handleClick = () => {
      if (isLoaded && user && !isChecking) {
        checkUserStatus();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [isLoaded, user, checkUserStatus, isChecking]);

  if (!isLoaded) {
    return (
      <div className="login-page">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-2 text-secondary">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-page">
        <div className="flex flex-col items-center justify-center">
          <h1 className="font-bold text-2xl mb-4 text-red-400">No autorizado</h1>
          <p className="text-slate-300">Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="login-page">
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-sm rounded-lg p-8 border border-slate-700">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="font-bold text-2xl mb-2 text-stone-300">
                Tu cuenta está en espera de aprobación
              </h1>
              <p className="text-slate-400 mb-6">
                Gracias por registrarte. Estamos revisando tu solicitud y te notificaremos pronto.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center mb-2">
                <div className={`animate-spin rounded-full h-6 w-6 border-b-2 border-secondary transition-opacity ${isChecking ? 'opacity-100' : 'opacity-50'}`}></div>
                <span className="ml-2 text-secondary text-sm">
                  {isChecking ? 'Verificando estado...' : 'Monitoreando cambios...'}
                </span>
              </div>
              
              {lastChecked && (
                <p className="text-xs text-slate-500">
                  Última verificación: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex flex-col space-y-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Estado:</span>
                  <span className="text-yellow-400 capitalize">
                    {user.publicMetadata.status === 'waiting' ? 'Esperando aprobación' : 'Activo'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Aprobado:</span>
                  <span className={user.publicMetadata.approved ? 'text-green-400' : 'text-red-400'}>
                    {user.publicMetadata.approved ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={checkUserStatus}
              disabled={isChecking}
              className="mt-6 w-full bg-secondary/20 hover:bg-secondary/30 disabled:opacity-50 disabled:cursor-not-allowed text-secondary border border-secondary/30 rounded-lg py-2 px-4 text-sm transition-colors"
            >
              {isChecking ? 'Verificando...' : 'Verificar ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}