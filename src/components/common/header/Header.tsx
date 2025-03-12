/* eslint-disable react/no-children-prop */
'use client'

import { Button } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { IconFileSpark, IconRefresh, IconFileDollar, IconMenu2, IconUsers } from "@tabler/icons-react";
import { useQuote } from "@/context/QuoteContext";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthState, useSignOut } from "react-firebase-hooks/auth";
import { firebaseAuth } from "@/utils/firebase/config";
import { removeSession } from "@/utils/firebase/auth-actions";
import { getApp } from "firebase/app";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { doc, getFirestore } from "firebase/firestore";

// Inicializar Firestore
const db = getFirestore(getApp());


const Header = () => {
  // Usar useDocumentData para obtener los datos del usuario desde Firestore
  const router = useRouter();
  const [signOut] = useSignOut(firebaseAuth);
  const { state, dispatch } = useQuote();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user] = useAuthState(firebaseAuth);

  const [firestoreUserData] = useDocumentData(
    user ? doc(db, 'users', user.uid) : null
  );
  const pathName = usePathname();

  const userData = state.user;

  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_USER', payload: firestoreUserData });
    } else {
      dispatch({ type: 'CLEAR_USER' });
    }
  }, [user, dispatch, firestoreUserData]);

  const handleSegmentChange = (segment: 'formula' | 'quote') => {
    dispatch({ type: 'SET_SEGMENT', payload: segment });
    onClose();
    if (segment === 'quote') {
      document.body.classList.remove('formula');
    }

    if (segment === 'formula') {
      document.body.classList.add('formula')
    }

    if (segment === 'quote' && pathName === '/kits') {
      redirect('/productos')
    }
  };

  const handleReset = async () => {
    dispatch({ type: 'RESET_QUOTE' });
    onClose();
  };

  const handleLogout = async () => {
    try {
      dispatch({ type: 'CLEAR_USER' });
      await removeSession();
      await signOut();
    } catch (error) {
      console.error('Error durante logout:', error);
    } finally {
      redirect('/');
    }
  };

  return (
    <>
      <Navbar isBordered>
        <NavbarContent>
          {userData && <Button isIconOnly aria-label={isOpen ? "Close menu" : "Open menu"} onPress={onOpen} variant="light">
            <IconMenu2 stroke={2} />
          </Button>}
          <Image priority={true} src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
        {userData && <NavbarContent justify="center">
          <h1 className="text-xl font-Trajan-pro-bold">{state.segment === 'formula' ? 'FORMULADOR' : 'COTIZADOR'}</h1>
        </NavbarContent>}
        {userData && <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar isBordered src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones de usuario" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Hola!</p>
                <p className="font-semibold">{userData.email}</p>
              </DropdownItem>
              <DropdownItem key="settings">Editar Perfil</DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger" onPress={handleLogout}>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>}
      </Navbar>
      <Drawer isOpen={isOpen} size="xs" onClose={onClose} placement="left" backdrop="blur" hideCloseButton>
        <DrawerContent>
          {() => (
            <>
              <DrawerBody className="pt-16">
                <Listbox>
                  <ListboxSection showDivider={userData?.role === 'admin'} title="Configuración">
                    <ListboxItem
                      key="quote"
                      className={state.segment === 'quote' ? 'text-primary' : ''}
                      description="Cotizacion para mi cliente"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconFileDollar stroke={2} />
                        </div>
                      }
                      onPress={() => handleSegmentChange('quote')}
                    >
                      Cotizador
                    </ListboxItem>
                    <ListboxItem
                      key="formula"
                      className={state.segment === 'formula' ? 'text-primary' : ''}
                      description="Formulacion para mi paciente"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconFileSpark stroke={2} />
                        </div>
                      }
                      onPress={() => handleSegmentChange('formula')}
                    >
                      Formulador
                    </ListboxItem>
                    <ListboxItem
                      key="reset"
                      className="text-danger"
                      description="Restablecer valores por defecto"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconRefresh stroke={2} />
                        </div>
                      }
                      onPress={handleReset}
                    >
                      Restableces Valores
                    </ListboxItem>
                  </ListboxSection>
                  {userData?.role === 'admin' ? (<ListboxSection title="Administración">
                    <ListboxItem
                      key="users"
                      description="Panel de administración de usuarios"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconUsers stroke={2} />
                        </div>
                      }
                      onPress={() => {
                        onClose();
                        router.push('/admin/usuarios')
                      }
                      }
                    >
                      Administrar Usuarios
                    </ListboxItem>
                  </ListboxSection>) : null}
                </Listbox>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Header