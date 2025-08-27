'use client'

import { SignUp, SignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Inicializar el estado basado en el hash actual
  useEffect(() => {
    const hash = window.location.hash;
    // Mostrar login si no hay hash o si el hash es #sign-in
    setIsLogin(hash === '#sign-in' || hash === '');
  }, []);

  // Escuchar cambios en el hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      // Mostrar login si no hay hash o si el hash es #sign-in
      setIsLogin(hash === '#sign-in' || hash === '');
    };

    window.addEventListener('hashchange', handleHashChange);

    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


  useEffect(() => {
    if (isLoaded && user) {
      // Verificar el estado del usuario
      const userRole = user.publicMetadata.role as string;
      const userStatus = user.publicMetadata.status as string;
      
      console.log('User metadata:', user.publicMetadata);
      
      // Redirigir según el estado del usuario
      if (userRole === 'pending' || userStatus === 'waiting') {
        router.push('/waiting-room');
      } else if (userRole === 'user' && userStatus === 'active') {
        const isProfileComplete = user.publicMetadata.isProfileComplete as boolean;
        if (!isProfileComplete) {
          router.push('/perfil');
        } else {
          router.push('/productos');
        }
      } else if (userRole === 'admin') {
        router.push('/admin');
      }
    }
  }, [user, isLoaded, router]);

  return (
    <div className="login-page min-h-screen flex bg-cover bg-center relative">
      
      <div className="container mx-auto flex flex-col items-center justify-center h-full px-4">

        {/* Componentes de Clerk */}
        {isLogin ? (
          <SignIn
            routing="hash"
            signUpUrl="#sign-up"
            fallbackRedirectUrl="/productos"
          />
        ) : (
          <SignUp
            routing="hash"
            signInUrl="#sign-in"
            fallbackRedirectUrl="/waiting-room"
          />
        )}
        
        {/* Botón personalizado para alternar */}
        <div className="mt-6 text-center border-t border-primary/20 pt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary-dark font-Swiss-medium transition-colors duration-200"
          >
            {isLogin 
              ? "¿No tienes cuenta? Regístrate aquí" 
              : "¿Ya tienes cuenta? Inicia sesión"
            }
          </button>
        </div>
      </div>
    </div>
  );
}