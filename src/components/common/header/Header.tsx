/* eslint-disable react/no-children-prop */
'use client'

import { Button } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { IconFileSpark, IconRefresh, IconFileDollar, IconMenu2, IconUsers } from "@tabler/icons-react";
import { useQuote } from "@/context/QuoteContext";
import { redirect, usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";


const Header = () => {
  const supabase = createClient()
  const router = useRouter();
  const { state, dispatch } = useQuote();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();

  const user = state.user;

  useEffect(() => {
    // Configurar el listener para cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          dispatch({ type: 'SET_USER', payload: session.user });
        } else if (event === 'SIGNED_OUT') {
          dispatch({ type: 'CLEAR_USER' });
          router.push('/');
        }
      }
    );

    // Verificar si hay una sesión activa al cargar el componente
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          dispatch({ type: 'SET_USER', payload: session.user });
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      }
    };

    checkSession();

    // Limpiar el listener cuando el componente se desmonte
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router, pathName, dispatch]);

  const handleSegmentChange = (segment: 'formula' | 'quote') => {
    dispatch({ type: 'SET_SEGMENT', payload: segment });
    onClose();
    if (segment === 'quote' && pathName === '/kits') {
      redirect('/productos')
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_QUOTE' });
    onClose();
  };

  const handleLogout = async () => {
    try {
      supabase.auth.signOut();
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  };

  return (
    <>
      <Navbar isBordered>
        <NavbarContent>
          {user && <Button isIconOnly aria-label={isOpen ? "Close menu" : "Open menu"} onPress={onOpen} variant="light">
            <IconMenu2 stroke={2} />
          </Button>}
          <Image priority={true} src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
        {user && <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar isBordered src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones de usuario" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Hola!</p>
                <p className="font-semibold">{user.email}</p>
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
                  <ListboxSection showDivider title="Configuración">
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
                  <ListboxSection title="Administración">
                    <ListboxItem
                      key="users"
                      description="Panel de administración de usuarios"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <IconUsers stroke={2} />
                        </div>
                      }
                    >
                      Administrar Usuarios
                    </ListboxItem>
                  </ListboxSection>
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