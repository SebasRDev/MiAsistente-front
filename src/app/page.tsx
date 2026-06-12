'use client'

import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Form, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner, useDisclosure } from "@heroui/react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { getApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword, useSendPasswordResetEmail, useSignInWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { toast } from "sonner";


import { Google } from "@/components/common/icons/icons";
// import InstallPrompt from "@/components/pwa/InstallPrompt";
// import PushNotificationManager from "@/components/pwa/PushNoptificationsManager";
import { translateAuthError } from "@/utils/errorTranslations";
import { createSession } from "@/utils/firebase/auth-actions";
import { firebaseAuth } from "@/utils/firebase/config";

// import { subscribeUser, unsubscribeUser, sendNotification } from './actions';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isTerms, setIsTerms] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [recoverPasswordEmail, setRecoverPasswordEmail] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter();

  const [signInWithEmailAndPassword, , , signInError] = useSignInWithEmailAndPassword(firebaseAuth);
  const [createUserWithEmailAndPassword, , , registerError] = useCreateUserWithEmailAndPassword(firebaseAuth);
  const [signInWithGoogle] = useSignInWithGoogle(firebaseAuth);
  const [sendPasswordResetEmail, sending, errorResetPassword] = useSendPasswordResetEmail(
    firebaseAuth
  );

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION;

  if (registerError) {
    const msg = translateAuthError(registerError.code);
    toast.error(msg);
    if (!authError) setAuthError(msg);
  }

  if (signInError) {
    const msg = translateAuthError(signInError.code);
    toast.error(msg);
    if (!authError) setAuthError(msg);
  }

  if (errorResetPassword) {
    toast.error(errorResetPassword.message);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setAuthError(null);
    setIsLoading(true);

    try {
      let result;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (isLogin) {
        result = await signInWithEmailAndPassword(email, password);
      } else {
        const confirmPassword = formData.get('confirm_password') as string;
        if (password !== confirmPassword) {
          const msg = 'Las contraseñas no coinciden';
          setAuthError(msg);
          toast.error(msg);
          setIsLoading(false);
          return;
        }
        if (isTerms) {
          result = await createUserWithEmailAndPassword(email, password);
        } else {
          toast.error('Debes aceptar los términos y condiciones para registrarte');
        }
      }

      if (result && result.user) {
        await createSession(result.user.uid);
        const db = getFirestore(getApp());
        const userDocRef = doc(db, 'users', result.user.uid);

        const userDoc = await getDoc(userDocRef);

        // Procesar displayName para obtener nombre y apellido
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (!userDoc.exists()) {
          // Si el usuario no existe, crear un documento nuevo
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            name: firstName,
            lastName: lastName,
            avatar: result.user.photoURL,
            createdAt: new Date(),
            approved: false,
            isProfileComplete: false,
            role: 'profesional' // Asignar rol por defecto
          });
          // Redirigir a la sala de espera después de registrar un nuevo usuario
          router.push('/waiting-room');
          return;
        }
        // Si el usuario ya existe, verificar su estado
        const userData = userDoc.data();
        if (userData?.approved === false) {
          router.push('/waiting-room');
        } else if (userData?.isProfileComplete === false) {
          router.push('/perfil');
        } else {
          router.push('/productos');
        }
      }

    } catch (error: any) {
      if (!error.toString().includes('NEXT_REDIRECT')) {
        console.error("Error real:", error);
        toast.error('An unexpected error occurred');
      }
      console.log({ code: error.code, message: error.message });
    } finally {
      setIsLoading(false);
    }

  }

  const handleSignInGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      const db = getFirestore(getApp());
      let userDocRef;
      if (result && result.user) {
        userDocRef = doc(db, 'users', result.user.uid);

        const userDoc = await getDoc(userDocRef);

        // Procesar displayName para obtener nombre y apellido
        const displayName = result.user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        if (!userDoc.exists()) {
          // Si el usuario no existe, crear un documento nuevo
          await setDoc(userDocRef, {
            uid: result.user.uid,
            email: result.user.email,
            name: firstName,
            lastName: lastName,
            avatar: result.user.photoURL || null,
            createdAt: new Date(),
            approved: false,
            isProfileComplete: false,
            role: 'profesional'
          });
        } else {
          // Si el usuario existe, actualizar solo los campos que cambiaron
          const userData = userDoc.data();
          const updates: any = {};

          if (result.user.photoURL && userData.avatar !== result.user.photoURL) {
            updates.avatar = result.user.photoURL;
          }
          if (!userData.name && firstName) updates.name = firstName;
          if (!userData.lastName && lastName) updates.lastName = lastName;

          if (Object.keys(updates).length > 0) {
            await setDoc(userDocRef, updates, { merge: true });
          }
        }

        await createSession(result.user.uid);
        if (userDocRef) {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.data()?.approved === false) {
            router.push('/waiting-room');
          }
          else if (userDoc.data()?.isProfileComplete === false) {
            router.push('/perfil');
          }
          else {
            router.push('/productos');
          }
        }
      }
    } catch (error) {
      console.error("Error real:", error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleVisibilityConfirm = () => setIsVisibleConfirm(!isVisibleConfirm);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <p className="text-white text-lg">Iniciando sesión...</p>
          </div>
        </div>
      )}
      <div className="login-page">
        <div className="container max-w-6xl w-11/12 mx-auto flex justify-end">
          <Card isBlurred className="max-w-96 w-full shrink-0" style={{ "WebkitBackdropFilter": "blur(16px) saturate(1.5)" } as React.CSSProperties}>
            <CardHeader>
              <h1 className="text-white text-center text-2xl w-full">Mi Asistente SkinHealth</h1>
            </CardHeader>
            <CardBody>
              <Button
                className="mb-8 bg-white text-primary font-bold text-md"
                radius="sm"
                color="primary"
                startContent={<Google />}
                onPress={() => handleSignInGoogle()}
                isLoading={isLoading}
              >
                Ingresar con Google
              </Button>
              <Form onSubmit={handleSubmit}>
                <Input
                  isRequired
                  label="Email"
                  name="email"
                  placeholder="Ingresa tu email"
                  type="email"
                />
                <Input
                  isRequired
                  endContent={
                    <button
                      aria-label={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibility}
                    >
                      {isVisible ? (
                        <IconEyeClosed stroke={1.5} />
                      ) : (
                        <IconEye stroke={1.5} />
                      )}
                    </button>
                  }
                  name="password"
                  label="Contraseña"
                  placeholder="Ingresa tu contraseña"
                  type={isVisible ? "text" : "password"}
                />
                {!isLogin && <Input
                  isRequired
                  endContent={
                    <button
                      aria-label={isVisibleConfirm ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                      className="focus:outline-none"
                      type="button"
                      onClick={toggleVisibilityConfirm}
                    >
                      {isVisibleConfirm ? (
                        <IconEyeClosed stroke={1.5} />
                      ) : (
                        <IconEye stroke={1.5} />
                      )}
                    </button>
                  }
                  name="confirm_password"
                  label="Confirmar contraseña"
                  placeholder="Confirma tu contraseña"
                  type={isVisibleConfirm ? "text" : "password"}
                />}
                {!isLogin && <div className="flex items-center gap-2">
                  <Checkbox isSelected={isTerms} onValueChange={setIsTerms} size="md" name="terms" required={!isLogin}>
                    <p className="text-sm text-white">
                      Acepto los
                    </p>
                  </Checkbox>
                  <Link className="cursor-pointer" size="sm" underline="always" target="_blank" rel="noopener noreferrer" href="/terminos-y-condiciones">términos y condiciones</Link>
                </div>}
                {authError && (
                  <p role="alert" aria-live="assertive" className="text-danger text-sm w-full">
                    {authError}
                  </p>
                )}
                {isLogin && <Link className="cursor-pointer" size="sm" color="primary" onPress={onOpen}>¿Olvidaste tu contraseña?</Link>}
                <Button
                  type="submit" variant="solid" color="primary" size="md" isLoading={isLoading}>
                  {isLogin ? "Ingresar" : "Registrate"}
                </Button>
              </Form>
            </CardBody>
            <CardFooter>
              <p className="text-white text-sm">¿No tienes cuenta aún? <Button
                type="button"
                variant="light"
                color="primary"
                size="md"
                onPress={() => { setIsLogin(!isLogin); setAuthError(null); }}>
                {isLogin ? "Registrate" : "Ingresar"}
              </Button></p>
            </CardFooter>
          </Card>
        </div>
        <Modal backdrop="blur" isOpen={isOpen} placement="auto" onOpenChange={onOpenChange}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className='flex justify-center'>
                  <h2 className="font-Trajan-pro-bold text-3xl text-primary">Recuperar contraseña</h2>
                </ModalHeader>
                <ModalBody>
                  <Input label="Email" name="email" placeholder="Ingresa tu email" type="email" value={recoverPasswordEmail} onChange={(e) => setRecoverPasswordEmail(e.target.value)} />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    variant="ghost"
                    isLoading={sending}
                    onPress={
                      async () => {
                        const success = await sendPasswordResetEmail(
                          recoverPasswordEmail,
                          // actionCodeSettings
                        );
                        if (success) {
                          onClose();
                          toast.success('Se ha enviado un correo electrónico con un enlace para recuperar la contraseña');
                        }
                      }
                    }
                  >
                    Confirmar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        {/* <PushNotificationManager />
        <InstallPrompt /> */}
      </div>
      <p className="text-white text-xs absolute bottom-5 w-full text-center">Mi Asistente v.{appVersion}</p>
    </>
  )
}