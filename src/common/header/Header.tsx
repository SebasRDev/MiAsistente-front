/* eslint-disable react/no-children-prop */
'use client'

import { Button, PressEvent } from "@heroui/button";
import { Navbar, NavbarContent } from "@heroui/navbar"
import { Avatar, Drawer, DrawerBody, DrawerContent, DrawerHeader, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Listbox, ListboxItem, ListboxSection, useDisclosure } from "@heroui/react";
import Image from "next/image";
import { AdminUsersIcon, DownloadQuoteIcon, MenuIcon, NewQuoteIcon } from '../icons/icons';

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Navbar isBordered>
        <NavbarContent>
          <Button isIconOnly aria-label={isOpen ? "Close menu" : "Open menu"} onPress={onOpen} variant="light">
            <MenuIcon />
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
        <DrawerContent children={undefined}>
          {(onClose: ((e: PressEvent) => void) | undefined) => (
            <>
              <DrawerBody className="pt-16">
                <Listbox children={null}>
                  <ListboxSection children={null} showDivider>
                    <ListboxItem
                      description="Restablecer valores por defecto"
                      startContent={<NewQuoteIcon />}
                    >
                      Nueva Rexomendacion
                    </ListboxItem>
                    <ListboxItem
                      description="Descargar pdf"
                      startContent={<DownloadQuoteIcon />}
                    >
                      Nueva Rexomendacion
                    </ListboxItem>
                  </ListboxSection>
                  <ListboxSection children={null} title="Administración">
                    <ListboxItem
                      description="Panel de administración de usuarios"
                      startContent={<AdminUsersIcon />}
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