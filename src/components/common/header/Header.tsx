 

'use client'

import { useUser, useClerk, UserButton } from "@clerk/nextjs";
import { Button } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import { IconFileSpark, IconRefresh, IconFileDollar, IconMenu2, IconUsers, IconDeviceMobileDollar, IconBook, IconPencilCheck } from "@tabler/icons-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, CSSProperties } from "react";

import { useQuote } from "@/context/QuoteContext";

const Header = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { state, dispatch } = useQuote();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const pathName = usePathname();
  const isWaitingRoom = pathName.includes('waiting-room');

  useEffect(() => {
    if (state.segment === 'quote') {
      document.body.classList.remove('formula');
    } else if (state.segment === 'formula') {
      document.body.classList.add('formula');
    }
  }, [state.segment]);

  useEffect(() => {
    if (!user && isLoaded) {
      dispatch({ type: 'CLEAR_USER' });
    }

    if (user && isLoaded) {
      // Crear objeto de usuario basado en Clerk
      const clerkUserData = {
        uid: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.firstName || '',
        lastName: user.lastName || '',
        avatar: user.imageUrl || '',
        role: user.publicMetadata.role as string || 'profesional',
        approved: user.publicMetadata.status === 'active',
        isProfileComplete: user.publicMetadata.isProfileComplete as boolean || false,
      };

      if (!state.user || state.user.uid !== user.id) {
        dispatch({ type: 'SET_USER', payload: clerkUserData });
      }
    }
  }, [user, isLoaded, dispatch, state.user]);

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
      dispatch({ type: 'CLEAR_USER' });
      await signOut(() => router.push('/'));
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  };

  // Obtener datos del usuario desde el state o directamente de Clerk
  const userData = state.user || (user && isLoaded ? {
    uid: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: user.firstName || '',
    lastName: user.lastName || '',
    avatar: user.imageUrl || '',
    role: user.publicMetadata.role as string || 'profesional',
    approved: user.publicMetadata.status === 'active',
    isProfileComplete: user.publicMetadata.isProfileComplete as boolean || false,
  } : null);

  // Obtener rol del usuario
  const userRole = user?.publicMetadata.role as string || userData?.role || 'profesional';

  if (!isLoaded) {
    return null; // O un skeleton/loading component
  }

  return (
    <>
      <Navbar isBordered style={{ "--tw-backdrop-blur": "blur(4px)", "WebkitBackdropFilter": "blur(16px) saturate(1.5)" } as CSSProperties}>
        <NavbarContent className="gap-0">
          {userData && !isWaitingRoom && (
            <Button 
              isIconOnly 
              aria-label={isOpen ? "Close menu" : "Open menu"} 
              onPress={onOpen} 
              variant="light"
            >
              <IconMenu2 stroke={2} />
            </Button>
          )}
          <Image priority={true} src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
        
        {userData && !isWaitingRoom && (
          <NavbarContent justify="center">
            <h1 className="text-md md:text-xl font-Trajan-pro-bold">
              {state.segment === 'formula' ? 'FORMULADOR' : 'COTIZADOR'}
            </h1>
          </NavbarContent>
        )}
        
        {userData && !isWaitingRoom && (
          <NavbarContent justify="end">
            {/* <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar 
                  className="cursor-pointer" 
                  isBordered 
                  src={userData.avatar || user?.imageUrl} 
                  alt={`${userData.name} ${userData.lastName}`} 
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Acciones de usuario" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Hola! {userData.name}</p>
                  <p className="font-semibold">{userData.email}</p>
                </DropdownItem>
                <DropdownItem key="settings" onPress={() => router.push('/perfil')}>
                  Editar Perfil
                </DropdownItem>
                <DropdownItem key="logout" color="danger" className="text-danger" onPress={handleLogout}>
                  Cerrar Sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown> */}
            <UserButton />
          </NavbarContent>
        )}
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
                <Listbox aria-label="menu">
                  <ListboxSection showDivider={userRole === 'admin'} title="Configuración">
                    {/* Cotizador - Solo para admin y asesor */}
                    {['admin', 'asesor'].includes(userRole) && (
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
                    )}
                    
                    {/* Formulador - Para todos los usuarios activos */}
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
                    
                    {/* Lista de precios */}
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
                    
                    {/* Catálogo público */}
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
                    
                    {/* Reset */}
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
                      Restablecer Valores
                    </ListboxItem>
                  </ListboxSection>
                  
                  {/* Sección de administración - Solo para admins */}
                  {userRole === 'admin' && (
                    <ListboxSection title="Administración">
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
                        }}
                      >
                        Administrar Usuarios
                      </ListboxItem>
                    </ListboxSection>
                  )}
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