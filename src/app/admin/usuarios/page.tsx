'use client'
import { Input, Pagination, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, SortDescriptor, Chip, Tooltip, Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Listbox, ListboxItem, PopoverTrigger, Popover, PopoverContent } from '@heroui/react';
import { IconCaretDownFilled, IconCircleDashedCheck, IconCircleDashedX, IconPencil, IconSearch, IconTrashX } from '@tabler/icons-react';
import { getApp } from 'firebase/app';
import { getFirestore, collection, DocumentData, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { useCallback, useMemo, useState } from "react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { toast } from 'sonner';


// Función para actualizar todos los roles a "profesional"
// const updateAllRolesToProfesional = async () => {
//   try {
//     const db = getFirestore(getApp());
//     const usersCollection = collection(db, 'users');
    
//     // Obtener todos los documentos
//     const querySnapshot = await getDocs(usersCollection);
    
//     // Usar batch para actualizar múltiples documentos de forma eficiente
//     const batch = writeBatch(db);
    
//     let updateCount = 0;
    
//     querySnapshot.forEach((document) => {
//       const userRef = doc(db, 'users', document.id);
//       batch.update(userRef, { role: 'profesional' });
//       updateCount++;
//     });
    
//     // Ejecutar todas las actualizaciones
//     await batch.commit();
    
//     toast.success(`Se actualizaron ${updateCount} usuarios a rol "profesional"`);
//     console.log(`Actualizados ${updateCount} usuarios exitosamente`);
    
//   } catch (error) {
//     console.error('Error al actualizar los roles:', error);
//     toast.error('Error al actualizar los roles: ' + error);
//   }
// };

const headerColumns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROL", uid: "role", sortable: true },
  { name: "PERIL COMPLETO", uid: "isProfileComplete", sortable: true },
  { name: "STATUS", uid: "approved", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];


export default function AdminUsers() {
  const [value, loading] = useCollection(
    collection(getFirestore(getApp()), 'users'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "approved",
    direction: "ascending",
  });
  const [docValues, setDocValues] = useState< {action: string, doc: DocumentData | null, callback: () => void}>({
    action: '',
    doc: null,
    callback: () => {}
  })
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const rowsPerPage = 20;
  const hasSearchFilter = Boolean(filterValue);

  let pages = 0;

  const deleteUser = async (id: string) => {
    try {
      const db = getFirestore(getApp());
      const userDoc = doc(collection(db, 'users'), id);
      await deleteDoc(userDoc);
      await deleteUser(id);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el usuario: ' + error);
    }
  }

  const userActions = async(action: string, doc: DocumentData) => {
    switch (action) {
      case 'edit':
        setDocValues({
          doc,
          action: 'Editar',
          callback: () => console.log('Editado')
        })
        onOpen();
        break;
      case 'delete':
        setDocValues({
          doc,
          action: 'Eliminar',
          callback: () => deleteUser(doc.id)
        })
        onOpen();
        break;
      default:
        break;
    }
  }

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...(value?.docs ?? [])];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.data()?.email.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }

    return filteredUsers.sort((a: DocumentData, b: DocumentData) => {
      const aData = a.data();
      const bData = b.data();
      const first = aData[sortDescriptor.column as string];
      const second = bData[sortDescriptor.column as string];

      // Manejar correctamente diferentes tipos de datos
      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second);
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      } else {
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      }
    });
  }, [value?.docs, hasSearchFilter, filterValue, sortDescriptor.column, sortDescriptor.direction]);

  if (filteredItems.length) {
    pages = Math.ceil(filteredItems.length / rowsPerPage);
  }

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end) || [];
  }, [filteredItems, page]);

  const topContent = useMemo(() => {
    return <div className="flex w-full">
      <Input
        isClearable
        className="w-full sm:max-w-[44%]"
        placeholder="Buscar usuarios..."
        startContent={<IconSearch stroke={1.5} size={24} />}
        value={filterValue}
        onClear={() => onClear()}
        onValueChange={onSearchChange}
      />
      {/* <Button
        className="ml-2"
        color="primary"
        variant="flat"
        onPress={updateAllRolesToProfesional}
      >
        Actualizar todos a Profesional
      </Button> */}
    </div>
  }, [filterValue, onClear, onSearchChange])

  const updateUser = async (id: string, status: boolean) => {
    try {
      const userRef = doc(getFirestore(getApp()), 'users', id);
      await updateDoc(userRef, { approved: status });
    } catch (error) {
      toast.error("Error al actualizar el usuario : " + error);
    }
  }

  const updateRole = async (id: string, role: 'admin' | 'profesional' | 'asesor') => {
    try {
      const userRef = doc(getFirestore(getApp()), 'users', id);
      await updateDoc(userRef, { role });
      toast.success("Rol actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el rol del usuario: " + error);
    }
  }

  return (
    <>
      <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
        <Table
          aria-label="users table"
          isHeaderSticky
          className='max-h-[78vh] h-auto'
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          topContent={topContent}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="secondary"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
        >
          <TableHeader columns={headerColumns} >
            {(column) => (
              <TableColumn key={column.uid} allowsSorting={column.sortable} align={column.uid === 'actions' ? 'center' : 'start'}>
                {column.name}
                {column.sortable && (
                  <span className="sr-only">Sort by {column.name}</span>
                )}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Spinner label="Cargando usuarios" />}
            items={items}
          >
            {(doc: DocumentData) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.data()?.name}</TableCell>
                <TableCell>{doc.data()?.email}</TableCell>
                <TableCell>
                  <Popover offset={10} placement="bottom">
                    <PopoverTrigger>
                      <Chip
                        size='md'
                        variant='bordered'
                        color={
                          doc.data()?.role === 'admin' ? 'secondary' :
                          doc.data()?.role === 'profesional' ? 'success' :
                          doc.data()?.role === 'asesor' ? 'warning' : 'default'
                        }
                        endContent={<IconCaretDownFilled stroke={1} size={15} />}
                      >
                        {doc.data()?.role}
                      </Chip>
                    </PopoverTrigger>
                    <PopoverContent>
                      <Listbox 
                        aria-label="Cambiar Rol"
                        items={items}
                        onAction={(key) => updateRole(doc.id, key as "profesional" | "admin" | "asesor")}
                      >
                        <ListboxItem key="admin">Admin</ListboxItem>
                        <ListboxItem key="profesional">Profesional</ListboxItem>
                        <ListboxItem key="asesor">Asesor</ListboxItem>
                      </Listbox>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  <Chip
                    size='md'
                    variant='flat'
                    color={doc.data()?.isProfileComplete ? 'success' : 'warning'}
                    startContent={
                      doc.data()?.isProfileComplete
                        ? <IconCircleDashedCheck stroke={1.5} size={20} />
                        : <IconCircleDashedX stroke={1.5} size={20} />
                    }
                  >
                    {doc.data()?.isProfileComplete ? 'Completo' : 'Incompleto'}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Switch
                    isSelected={doc.data()?.approved}
                    color="success"
                    size="sm"
                    onValueChange={
                      (value: boolean) => updateUser(doc.id, value)
                    }
                  />
                </TableCell>
                <TableCell align='center'>
                  <div className='flex items-center justify-center gap-2'>
                    {/* Todo: Add edit user button */}
                    {/* <Tooltip content="Editar">
                      <IconPencil className='cursor-pointer' stroke={2} size={20} onClick={() => userActions('edit', doc)} />
                    </Tooltip> */}
                    <Tooltip content="Eliminar" color="danger">
                      <IconTrashX className='cursor-pointer' stroke={2} color='red' size={20} onClick={() => userActions('delete', doc)} />
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-center'>{docValues.action} usuario</ModalHeader>
              <ModalBody className='text-center'>¿Está seguro que desea eliminar el usuario {docValues.doc?.data()?.email}?</ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color={docValues.action === 'Eliminar' ? 'danger' : 'primary'} onPress={() => {docValues.callback() ; onClose()}}>
                  {docValues.action === 'Eliminar' ? 'Eliminar' : 'Guardar'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}