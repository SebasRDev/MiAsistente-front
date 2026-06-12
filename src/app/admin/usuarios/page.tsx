'use client'
import { Input, Pagination, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, SortDescriptor, Chip, Tooltip, Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { IconCaretDownFilled, IconCircleDashedCheck, IconCircleDashedX, IconSearch, IconTrashX } from '@tabler/icons-react';
import { getApp } from 'firebase/app';
import { getFirestore, collection, DocumentData, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useCallback, useMemo, useState } from "react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { toast } from 'sonner';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const headerColumns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROL", uid: "role", sortable: true },
  { name: "PERFIL COMPLETO", uid: "isProfileComplete", sortable: true },
  { name: "STATUS", uid: "approved", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];

type RoleConfirm = { id: string; role: 'admin' | 'profesional' | 'asesor'; email: string } | null;

export default function AdminUsers() {
  const { profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [value, loading] = useCollection(
    collection(getFirestore(getApp()), 'users'),
    { snapshotListenOptions: { includeMetadataChanges: true } }
  );
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "approved",
    direction: "ascending",
  });
  const [docValues, setDocValues] = useState<{ action: string, doc: DocumentData | null, callback: () => void }>({
    action: '',
    doc: null,
    callback: () => {}
  });
  const [roleConfirm, setRoleConfirm] = useState<RoleConfirm>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isOpen: isRoleOpen, onOpen: onRoleOpen, onOpenChange: onRoleOpenChange } = useDisclosure();
  const rowsPerPage = 20;
  const hasSearchFilter = Boolean(filterValue);

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && profile && profile.role !== 'admin') {
      router.replace('/productos');
    }
  }, [profile, authLoading, router]);

  let pages = 0;

  const deleteUser = async (id: string) => {
    try {
      const db = getFirestore(getApp());
      const userDoc = doc(collection(db, 'users'), id);
      await deleteDoc(userDoc);
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar el usuario: ' + error);
    }
  };

  const userActions = async (action: string, doc: DocumentData) => {
    switch (action) {
      case 'delete':
        setDocValues({
          doc,
          action: 'Eliminar',
          callback: () => deleteUser(doc.id)
        });
        onOpen();
        break;
      default:
        break;
    }
  };

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
    </div>;
  }, [filterValue, onClear, onSearchChange]);

  const updateUser = async (id: string, status: boolean) => {
    try {
      const userRef = doc(getFirestore(getApp()), 'users', id);
      await updateDoc(userRef, { approved: status });
    } catch (error) {
      toast.error("Error al actualizar el usuario: " + error);
    }
  };

  const confirmRoleChange = (id: string, role: 'admin' | 'profesional' | 'asesor', email: string) => {
    setRoleConfirm({ id, role, email });
    onRoleOpen();
  };

  const applyRoleChange = async () => {
    if (!roleConfirm) return;
    try {
      const userRef = doc(getFirestore(getApp()), 'users', roleConfirm.id);
      await updateDoc(userRef, { role: roleConfirm.role });
      toast.success("Rol actualizado exitosamente");
    } catch (error) {
      toast.error("Error al actualizar el rol del usuario: " + error);
    } finally {
      setRoleConfirm(null);
    }
  };

  if (authLoading) return null;
  if (profile?.role !== 'admin') return null;

  return (
    <>
      <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
        <Table
          aria-label="Tabla de usuarios"
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
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn key={column.uid} allowsSorting={column.sortable} align={column.uid === 'actions' ? 'center' : 'start'}>
                {column.name}
                {column.sortable && (
                  <span className="sr-only">Ordenar por {column.name}</span>
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
                  <Dropdown placement="bottom-start">
                    <DropdownTrigger>
                      <Chip
                        size='md'
                        variant='bordered'
                        color={
                          doc.data()?.role === 'admin' ? 'secondary' :
                          doc.data()?.role === 'profesional' ? 'success' :
                          doc.data()?.role === 'asesor' ? 'warning' : 'default'
                        }
                        endContent={<IconCaretDownFilled stroke={1} size={15} />}
                        className="cursor-pointer"
                      >
                        {doc.data()?.role}
                      </Chip>
                    </DropdownTrigger>
                    <DropdownMenu
                      aria-label="Cambiar Rol"
                      onAction={(key) => confirmRoleChange(doc.id, key as 'profesional' | 'admin' | 'asesor', doc.data()?.email)}
                    >
                      <DropdownItem key="admin">Admin</DropdownItem>
                      <DropdownItem key="profesional">Profesional</DropdownItem>
                      <DropdownItem key="asesor">Asesor</DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
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
                    aria-label={`${doc.data()?.approved ? 'Desactivar' : 'Activar'} usuario ${doc.data()?.email}`}
                    onValueChange={(value: boolean) => updateUser(doc.id, value)}
                  />
                </TableCell>
                <TableCell align='center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Tooltip content="Eliminar" color="danger">
                      <button
                        aria-label={`Eliminar usuario ${doc.data()?.email}`}
                        className="cursor-pointer"
                        onClick={() => userActions('delete', doc)}
                      >
                        <IconTrashX stroke={2} color='red' size={20} aria-hidden="true" />
                      </button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-center'>Eliminar usuario</ModalHeader>
              <ModalBody>
                <p className='text-center'>
                  ¿Está seguro que desea eliminar el usuario <strong>{docValues.doc?.data()?.email}</strong>?{' '}
                  Esta acción no se puede deshacer.
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button color="danger" onPress={() => { docValues.callback(); onClose(); }}>
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Modal de confirmación de cambio de rol */}
      <Modal isOpen={isRoleOpen} placement="center" onOpenChange={onRoleOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className='flex justify-center'>Confirmar cambio de rol</ModalHeader>
              <ModalBody>
                <p className='text-center'>
                  ¿Está seguro que desea cambiar el rol de <strong>{roleConfirm?.email}</strong> a <strong>{roleConfirm?.role}</strong>?
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={() => { setRoleConfirm(null); onClose(); }}>
                  Cancelar
                </Button>
                <Button color="primary" onPress={() => { applyRoleChange(); onClose(); }}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
