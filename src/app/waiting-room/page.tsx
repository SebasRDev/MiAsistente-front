'use client'
import { Button } from "@heroui/react";
import { getApp } from "firebase/app";
import { doc, getFirestore } from "firebase/firestore";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDocument } from "react-firebase-hooks/firestore";
import { useSignOut } from "react-firebase-hooks/auth";

import { useAuth } from "@/context/AuthContext";
import { removeSession } from "@/utils/firebase/auth-actions";
import { firebaseAuth } from "@/utils/firebase/config";

export default function WaitingRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const [signOut] = useSignOut(firebaseAuth);

  const userDocRef = user?.uid
    ? doc(getFirestore(getApp()), 'users', user.uid)
    : null;

  const [userSnapshot] = useDocument(
    userDocRef,
    userDocRef ? {
      snapshotListenOptions: { includeMetadataChanges: true },
    } : {}
  );

  useEffect(() => {
    if (userSnapshot && userSnapshot.exists()) {
      const userData = userSnapshot.data();
      if (userData?.approved === true) {
        if (userData?.isProfileComplete === true) {
          router.push('/productos');
        } else {
          router.push('/perfil');
        }
      }
    }
  }, [userSnapshot, router]);

  const handleLogout = async () => {
    try {
      await removeSession();
      await signOut();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      redirect('/');
    }
  };

  return (
    <div className="login-page">
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="font-bold text-4xl mb-4 text-stone-300 text-center">
          Tu cuenta está en espera de aprobación
        </h1>
        <p className="text-lg text-slate-300 mb-2 text-center">
          Gracias por registrarte. Estamos revisando tu solicitud.
        </p>
        <div className="mt-4 flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" aria-hidden="true" />
          <span className="ml-2 text-secondary" role="status" aria-live="polite">Verificando estado...</span>
        </div>
        <Button
          color="danger"
          variant="ghost"
          onPress={handleLogout}
          className="mt-4"
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
