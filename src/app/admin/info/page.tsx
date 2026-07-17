'use client';

import { Button, ButtonGroup, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Modal, ModalBody, ModalContent, ModalHeader, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip, useDisclosure } from "@heroui/react";
import { IconChevronDown, IconDownload, IconTrashX } from "@tabler/icons-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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
  products: "Sincroniza productos por id: crea, actualiza y elimina los que falten en el archivo.",
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
  const [isExporting, setIsExporting] = useState(false);

  const selectedOptionValue: OptionKey = Array.from(selectedOption)[0];

  const handleExport = () => {
    setIsExporting(true);
    fetch(`${process.env.NEXT_PUBLIC_ENDPOINTS_BASE}/api/products/export`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const blob = await res.blob();
        const disposition = res.headers.get('Content-Disposition');
        const match = disposition?.match(/filename="?([^";]+)"?/);
        const filename = match?.[1] ?? `products-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Productos exportados correctamente.');
      })
      .catch((error) => {
        console.error('Error exporting products:', error);
        toast.error('Ocurrió un error al exportar los productos.');
      })
      .finally(() => setIsExporting(false));
  };

  return(
    <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ButtonGroup variant="flat">
          <Button onPress={onOpen} className="bg-white">{labelsMap[selectedOptionValue]}</Button>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button isIconOnly className="bg-white">
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

        <Button
          variant="flat"
          className="bg-white"
          startContent={!isExporting && <IconDownload stroke={2} size={18} />}
          isLoading={isExporting}
          onPress={handleExport}
        >
          Exportar Productos (.xlsx)
        </Button>
      </div>

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