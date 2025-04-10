'use client'
import { getApp } from "firebase/app";
import { doc, getFirestore } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDocument } from "react-firebase-hooks/firestore";

import { useQuote } from "@/context/QuoteContext"

export default function  WaitingRoom() {
  const { state } = useQuote();
  const router = useRouter();
  // Only create the document reference if we have a user
  const userDocRef = state.user?.uid 
    ? doc(getFirestore(getApp()), 'users', state.user.uid)
    : null;
  
  // Only use the hook if we have a valid reference
  const [userSnapshot, loading, error] = useDocument(
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
  
  return (
    <div className="login-page">
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold text-4xl mb-4 text-stone-300 text-center">Tu cuenta está en espera de aprobación</h1>
        <p className="text-lg text-slate-300 mb-2 text-center">Gracias por registrarte. Estamos revisando tu solicitud.</p>
        <div className="mt-4 flex items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          <span className="ml-2 text-secondary">Verificando estado...</span>
        </div>
      </div>
    </div>
  )
}