/* eslint-disable react/no-children-prop */

'use client'

import { Button } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import { IconFileSpark, IconRefresh, IconFileDollar, IconMenu2, IconUsers, IconDeviceMobileDollar, IconBook } from "@tabler/icons-react";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, CSSProperties } from "react";
import { useSignOut } from "react-firebase-hooks/auth";

import { useAuth } from "@/context/AuthContext";
import { useQuote } from "@/context/QuoteContext";
import { removeSession } from "@/utils/firebase/auth-actions";
import { firebaseAuth } from "@/utils/firebase/config";


const Header = () => {
  const router = useRouter();
  const [signOut] = useSignOut(firebaseAuth);
  const { state, dispatch } = useQuote();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, profile, loading } = useAuth();

  const pathName = usePathname();
  const isWaitingRoom = pathName.includes('waiting-room');

  useEffect(() => {
    if (state.segment === 'quote') {
      document.body.classList.remove('formula');
    } else if (state.segment === 'formula') {
      document.body.classList.add('formula');
    }
  }, [state.segment]);

  const handleSegmentChange = (segment: 'formula' | 'quote') => {
    dispatch({ type: 'SET_SEGMENT', payload: segment });
    onClose();
    router.push('/productos')
  };

  const handleReset = async () => {
    dispatch({ type: 'RESET_QUOTE' });
    onClose();
  };

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

  // Loading state - show minimal navbar
  if (loading) {
    return (
      <Navbar isBordered style={{ "--tw-backdrop-blur": "blur(4px)", "WebkitBackdropFilter": "blur(16px) saturate(1.5)" } as CSSProperties}>
        <NavbarContent className="gap-0">
          <Image priority={true} src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
      </Navbar>
    );
  }

  return (
    <>
      <Navbar isBordered style={{ "--tw-backdrop-blur": "blur(4px)", "WebkitBackdropFilter": "blur(16px) saturate(1.5)" } as CSSProperties}>
        <NavbarContent className="gap-0">
          {profile && !isWaitingRoom && <Button isIconOnly aria-label={isOpen ? "Close menu" : "Open menu"} onPress={onOpen} variant="light">
            <IconMenu2 stroke={2} />
          </Button>}
          <Image priority={true} src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
        {profile && !isWaitingRoom && <NavbarContent justify="center">
          <h1 className="text-md md:text-xl font-Trajan-pro-bold">{state.segment === 'formula' ? 'FORMULADOR' : 'COTIZADOR'}</h1>
        </NavbarContent>}
        {profile && !isWaitingRoom && <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar className="cursor-pointer" isBordered src={profile.avatar || undefined} alt={`${profile.name} ${profile.lastName}`} />
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones de usuario" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Hola! {profile.name}</p>
                <p className="font-semibold">{profile.email}</p>
              </DropdownItem>
              <DropdownItem key="settings" onPress={() => router.push('/perfil')}>Editar Perfil</DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger" onPress={handleLogout}>
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>}
      </Navbar>
      <Drawer
        isOpen={isOpen}
        size="xs"
        onClose={onClose}
        placement="left"
        backdrop="blur"
        hideCloseButton
      >
        <DrawerContent>
          {() => (
            <>
              <DrawerBody className="pt-16">
                <Listbox>
                  <ListboxSection showDivider={profile?.role === 'admin'} title="Configuración">
                    {['admin', 'asesor'].includes(profile?.role || '') ? (
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
                    ) : null}
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
                      key="price-list"
                      description="Lista de precios virtual"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconDeviceMobileDollar stroke={2} />
                        </div>
                      }
                      onPress={() => {
                        onClose();
                        router.push('/lista-de-precios')
                      }}
                    >
                      Lista de precios
                    </ListboxItem>
                    <ListboxItem
                      key="public-catalog"
                      description="Catalogo público"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconBook stroke={2} />
                        </div>
                      }
                      onPress={() => {
                        onClose();
                        window.open('https://simplebooklet.com/catalogopublicoskh', '_blank');
                      }}
                    >
                      Catalogo público
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
                  {profile?.role === 'admin' ? (<ListboxSection title="Administración">
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