'use client';

import { Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@heroui/react";
import { IconChevronDown, IconTrashX } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";

import UploadModal from "@/app/admin/info/upload";
import { productOptions } from "@/app/productos/product";
import { Product } from "@/types/quote"


const headerColumns = [
  { name: "CÓDIGO", uid: "code", sortable: true },
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "PÚBLICO", uid: "prublicPrice", sortable: true },
  { name: "PROFESIONAL", uid: "proffesionalPrice", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];

type OptionKey = "products" | "kits";

const descriptionsMap: Record<OptionKey, string> = {
  products: "Actualizar la lista de productos desde el archivo subido.",
  kits: "Actualizar la lista de kits desde el archivo subido.",
};

const labelsMap: Record<OptionKey, string> = {
  products: "Actualizar Productos",
  kits: "Actualizar Kits",
};

export default function AdminProductsPage() {
  const { data } = useSuspenseQuery(productOptions);
  const [selectedOption, setSelectedOption] = useState<Set<OptionKey>>(new Set<OptionKey>(["products"]));
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  const selectedOptionValue: OptionKey = Array.from(selectedOption)[0];

  return(
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">

      <ButtonGroup variant="flat" className="mb-4">
        <Button onPress={onOpen}>{labelsMap[selectedOptionValue]}</Button>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button isIconOnly>
              <IconChevronDown stroke={2}/>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            disallowEmptySelection
            aria-label="Merge options"
            className="max-w-[300px]"
            selectedKeys={selectedOption}
            selectionMode="single"
            onSelectionChange={(keys) => {
              const keyArray = Array.from(keys as Set<string>);
              const filtered = keyArray.filter((k): k is OptionKey => k === 'products' || k === 'kits');
              setSelectedOption(new Set(filtered));
            }}
          >
            <DropdownItem key="products" description={descriptionsMap["products"]}>
              {labelsMap["products"]}
            </DropdownItem>
            <DropdownItem key="kits" description={descriptionsMap["kits"]}>
              {labelsMap["kits"]}
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>

      <Table
        aria-label="products table"
        isHeaderSticky
        className='max-h-[78vh] h-auto'
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn key={column.uid}>
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={data}>
          {(item: Product) => (
            <TableRow key={item.id}>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.publicPrice ? `$${item.publicPrice}` : 'N/A'}</TableCell>
              <TableCell>{item.profesionalPrice ? `$${item.profesionalPrice}` : 'N/A'}</TableCell>
              <TableCell>
                <Tooltip content="Eliminar Producto" color="danger">
                  <IconTrashX className='cursor-pointer' stroke={2} color='red' size={20} onClick={() => console.log(
                    `Eliminar producto ${item.code}`
                  )} />
                </Tooltip>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          <ModalHeader>
            <h2 className="text-2xl font-bold">{labelsMap[selectedOptionValue]}</h2>
          </ModalHeader>
          <ModalBody>
            <UploadModal option={selectedOptionValue}/>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}