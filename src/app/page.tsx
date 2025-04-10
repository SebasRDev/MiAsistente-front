'use client'

import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Form, Input, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { IconEye, IconEyeClosed } from "@tabler/icons-react";
import { getApp } from "firebase/app";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useCreateUserWithEmailAndPassword, useSendPasswordResetEmail, useSignInWithEmailAndPassword, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { toast } from "sonner";

import { Google } from "@/components/common/icons/icons";
import { createSession } from "@/utils/firebase/auth-actions";
import { firebaseAuth } from "@/utils/firebase/config";
import { translateAuthError } from "@/utils/errorTranslations";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isTerms, setIsTerms] = useState(false);
  const [recoverPasswordEmail, setRecoverPasswordEmail] = useState('');
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter();

  const [signInWithEmailAndPassword, user, loading, signInError] = useSignInWithEmailAndPassword(firebaseAuth);
  const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(firebaseAuth);
  const [signInWithGoogle] = useSignInWithGoogle(firebaseAuth);
  const [sendPasswordResetEmail, sending, errorResetPassword] = useSendPasswordResetEmail(
    firebaseAuth
  );

  if (signInError) {
    toast.error(translateAuthError(signInError.code));
  }

  if (errorResetPassword) {
    toast.error(errorResetPassword.message);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsLoading(true);

    try {
      let result;
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (isLogin) {
        result = await signInWithEmailAndPassword(email, password);
      } else {
        if (isTerms) {
          result = await createUserWithEmailAndPassword(email, password);
        }
        else {
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
            isProfileComplete: false
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
      console.log(error);
    } finally {
      setIsLoading(false);
    }

  }

  const handleSignInGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      const db = getFirestore(getApp());
      let userDocRef;
      if (result && result.user) {
        userDocRef = doc(db, 'users', result.user.uid);
        if (result.user.photoURL) {

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
              isProfileComplete: false
            });
          } else {
            // Si el usuario existe, verificar qué campos necesitan actualizarse
            const userData = userDoc.data();
            const updates: any = {};

            // Verificar si el avatar ha cambiado
            if (!userData.avatar || userData.avatar !== result.user.photoURL) {
              updates.avatar = result.user.photoURL;
            }

            // Verificar si el nombre ha cambiado
            if (!userData.name || userData.name !== firstName) {
              updates.name = firstName;
            }

            // Verificar si el apellido ha cambiado
            if (!userData.lastName || userData.lastName !== lastName) {
              updates.lastName = lastName;
            }

            // Solo actualizar si hay cambios
            if (Object.keys(updates).length > 0) {
              await setDoc(userDocRef, updates, { merge: true });
            }
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
    }
  }

  const toggleVisibility = () => setIsVisible(!isVisible);

  return (
    <div className="login-page">
      <div className="container max-w-6xl w-11/12 mx-auto flex justify-end">
        <Card isBlurred className="max-w-96 w-full shrink-0" style={{ "WebkitBackdropFilter": "blur(16px) saturate(1.5)" } as React.CSSProperties}>
          <CardHeader>
            <p className="text-white text-center text-2xl">Mi Asistente SkinHealth</p>
          </CardHeader>
          <CardBody>
            <Button
              className="mb-8 bg-white text-primary font-bold text-md"
              radius="sm"
              color="primary"
              startContent={<Google />}
              onPress={() => handleSignInGoogle()}
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
                endContent={
                  <button
                    aria-label="toggle password visibility"
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
                endContent={
                  <button
                    aria-label="toggle password visibility"
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
                name="confirm_password"
                label="Confirmar contraseña"
                placeholder="Confirmar contraseña contraseña"
                type={isVisible ? "text" : "password"}
              />}
              {!isLogin && <div className="flex items-center gap-2">
                <Checkbox isSelected={isTerms} onValueChange={setIsTerms} size="md" name="terms" required={!isLogin}>
                  <p className="text-sm text-white">
                    Acepto los
                  </p>
                </Checkbox>
                <Link className="cursor-pointer" size="sm" underline="always" target="_blank" rel="noopener noreferrer" href="/terminos-y-condiciones">términos y condiciones</Link>
              </div>}
              {isLogin && <Link className="cursor-pointer" size="sm" color="primary" onPress={onOpen}>¿Olvidaste tu contraseña?</Link>}
              <Button
                type="submit" variant="solid" color="primary" size="md" isLoading={isLoading}>
                {isLogin ? "Ingresar" : "Registrate"}
              </Button>
            </Form>
          </CardBody>
          <CardFooter>
            <p className="text-white text-sm">¿No tienes cuenta aún? <Button
              type="submit"
              variant="light"
              color="primary"
              size="md"
              onPress={() => setIsLogin(!isLogin)}>
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
                        console.log('Email sent! to: ', recoverPasswordEmail);
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
    </div>
  )
}