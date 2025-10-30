'use client';

import { getApp } from 'firebase/app';
import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState, PropsWithChildren } from 'react';

import { User } from '@/types/user';
import { firebaseAuth } from '@/utils/firebase/config';
import { usePathname } from 'next/navigation';

/**
 * Extended user profile from Firestore
 */
export interface UserProfile extends User {
  uid: string;
  email: string | null;
  name?: string;
  lastName?: string;
  avatar?: string | null;
  createdAt?: Date;
  approved: boolean;
  isProfileComplete: boolean;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  /** Firebase Auth user object (null when logged out, undefined while loading) */
  user: FirebaseUser | null | undefined;
  /** Firestore user profile document (null when logged out, undefined while loading) */
  profile: UserProfile | null | undefined;
  /** True while fetching initial auth state and profile */
  loading: boolean;
  /** Error message if profile fetch fails */
  error: string | null;
  /** Current session user ID from cookie */
  sessionId: string | null;
}

const publicRoutes = ['/', '/terminos-y-condiciones'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Cost-efficient authentication provider
 *
 * Strategy:
 * - Uses onAuthStateChanged for reliable auth state detection
 * - Performs a SINGLE Firestore read when user logs in (cost-efficient)
 * - No real-time listeners (saves costs)
 * - Cleans up properly on logout
 *
 * Trade-off: Profile changes in Firestore require page refresh to reflect in Context
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<FirebaseUser | null | undefined>(undefined);
  const [profile, setProfile] = useState<UserProfile | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionCookie, setSessionCookie] = useState<string | null>(() => {
    const cookies = document.cookie.split(';');
    const cookieValue = cookies.find((cookie) => cookie.trim().startsWith('user-session='));
    return cookieValue?.split('=')[1] || null;
  });

  const pathname = usePathname();

  useEffect(() => {
    // Ya no necesitas el check de 'sessionCookie' aquí afuera.
    // El listener 'onAuthStateChanged' se encarga de todo.
    
    const unsubscribe = firebaseAuth.onAuthStateChanged(async (firebaseUser) => {
      setLoading(true);
      setError(null);

      // *** INICIO DEL CAMBIO ***
      // 1. Lee el estado ACTUAL de la cookie CADA VEZ que el auth cambie.
      const cookies = document.cookie.split(';');
      const cookieValue = cookies.find((cookie) => cookie.trim().startsWith('user-session='));
      const currentSessionId = cookieValue?.split('=')[1] || null;

      // 2. Actualiza el estado de la cookie en el context
      setSessionCookie(currentSessionId);

      const isPublicRoute = publicRoutes.includes(pathname);

      if (firebaseUser) {
        // Firebase dice que el usuario está logueado
        if (currentSessionId) {
          // Y NUESTRA COOKIE TAMBIÉN EXISTE: El usuario está logueado y activo
          setUser(firebaseUser);

          try {
            const db = getFirestore(getApp());
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              const data = userDoc.data();
              setProfile({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                // ... (resto de tus datos de perfil)
                role: data.role || 'profesional',
                approved: data.approved ?? false,
                isProfileComplete: data.isProfileComplete ?? false,
              });
            } else {
              setProfile(null);
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setError('Failed to load user profile');
            setProfile(null);
          }
        } else {
          // Firebase dice logueado, PERO NUESTRA COOKIE NO EXISTE
          // (Este es tu caso de prueba: cookie borrada)
          if (isPublicRoute) {
              // ESTÁ EN UNA RUTA PÚBLICA (Ej: /login)
              // No hacemos nada. Dejamos que la página de login
              // maneje la creación de la nueva sesión.
              // Lo tratamos como "logueado pero sin perfil/sesión".
              setUser(firebaseUser);
              setProfile(null);
          } else {
              // ESTÁ EN UNA RUTA PRIVADA
              // ¡Aquí sí! Forzamos el cierre de sesión.
            await firebaseAuth.signOut();
              // El estado se limpiará en el próximo disparo del listener
              // que entrará en el 'else' de abajo.
          }
          // El signOut() volverá a disparar este listener,
          // y entrará en el 'else' de abajo, limpiando el estado.
        }
      } else {
        // Firebase dice que el usuario NO está logueado
        setUser(null);
        setProfile(null);
        setSessionCookie(null); // Asegúrate de limpiar el estado de la cookie también
      }
      // *** FIN DEL CAMBIO ***

      setLoading(false);
    });

    // Cleanup: unsubscribe from auth state listener
    return () => {
      unsubscribe();
    };
  }, [pathname]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    sessionId: sessionCookie,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 *
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
