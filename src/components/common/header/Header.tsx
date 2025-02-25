/* eslint-disable react/no-children-prop */
'use client'

import { Button } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { IconFileSpark, IconRefresh, IconFileDollar, IconMenu2, IconUsers } from "@tabler/icons-react";
import { useQuote } from "@/context/QuoteContext";
import { redirect, usePathname } from "next/navigation";

const Header = () => {
  const { state, dispatch } = useQuote();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pathName = usePathname();

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

  return (
    <>
      <Navbar isBordered>
        <NavbarContent>
          <Button isIconOnly aria-label={isOpen ? "Close menu" : "Open menu"} onPress={onOpen} variant="light">
            <IconMenu2 stroke={2} />
          </Button>
          <Image src="/assets/logo_skh.webp" alt="Logo" width={55} height={55} />
        </NavbarContent>
        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar isBordered src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Avatar" />
            </DropdownTrigger>
            <DropdownMenu aria-label="Acciones de usuario" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">Hola!</p>
                <p className="font-semibold">sebas.ramirez@gmail.com</p>
              </DropdownItem>
              <DropdownItem key="settings">Editar Perfil</DropdownItem>
              <DropdownItem key="logout" color="danger" className="text-danger">
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button color="primary" size="md" variant="bordered">
            Iniciar Sesión
          </Button>
        </NavbarContent>
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