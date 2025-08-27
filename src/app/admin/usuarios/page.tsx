'use client'
import { Input, Pagination, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, SortDescriptor, Chip, Tooltip, Modal, useDisclosure, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Listbox, ListboxItem, PopoverTrigger, Popover, PopoverContent } from '@heroui/react';
import { IconCaretDownFilled, IconCircleDashedCheck, IconCircleDashedX, IconSearch, IconTrashX, IconRefresh } from '@tabler/icons-react';
import { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from 'sonner';

interface ClerkUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  imageUrl: string;
  publicMetadata: {
    role?: string;
    status?: string;
    isProfileComplete?: boolean;
    approved?: boolean;
    createdAt?: string;
    [key: string]: any;
  };
}

const headerColumns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROL", uid: "role", sortable: true },
  { name: "PERFIL COMPLETO", uid: "isProfileComplete", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACCIONES", uid: "actions" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<ClerkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [updatingUsers, setUpdatingUsers] = useState<{[key: string]: 'role' | 'status'}>({});
  // Estado para actualizaciones optimistas
  const [optimisticUpdates, setOptimisticUpdates] = useState<{[key: string]: Partial<ClerkUser['publicMetadata']>}>({});
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "status",
    direction: "ascending",
  });
  const [docValues, setDocValues] = useState<{
    action: string;
    user: ClerkUser | null;
    callback: () => void;
  }>({
    action: '',
    user: null,
    callback: () => {}
  });
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const rowsPerPage = 20;
  const hasSearchFilter = Boolean(filterValue);

  // Función para aplicar actualizaciones optimistas a los usuarios
  const getUsersWithOptimisticUpdates = useCallback((baseUsers: ClerkUser[]) => {
    return baseUsers.map(user => {
      const optimisticUpdate = optimisticUpdates[user.id];
      if (optimisticUpdate) {
        return {
          ...user,
          publicMetadata: {
            ...user.publicMetadata,
            ...optimisticUpdate
          }
        };
      }
      return user;
    });
  }, [optimisticUpdates]);

  // Cargar usuarios desde la API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      setUsers(data.users || []);
      // Limpiar actualizaciones optimistas después de cargar datos reales
      setOptimisticUpdates({});
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      toast.success('Usuario eliminado exitosamente');
      fetchUsers(); // Recargar lista
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const userActions = (action: string, user: ClerkUser) => {
    switch (action) {
      case 'delete':
        setDocValues({
          user,
          action: 'Eliminar',
          callback: () => deleteUser(user.id)
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

  // Aplicar actualizaciones optimistas a los usuarios filtrados
  const usersWithOptimisticUpdates = useMemo(() => 
    getUsersWithOptimisticUpdates(users), 
    [users, getUsersWithOptimisticUpdates]
  );

  const filteredItems = useMemo(() => {
    let filteredUsers = [...usersWithOptimisticUpdates];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.emailAddresses[0]?.emailAddress.toLowerCase().includes(filterValue.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    return filteredUsers.sort((a: ClerkUser, b: ClerkUser) => {
      let first: any, second: any;

      switch (sortDescriptor.column) {
        case 'name':
          first = `${a.firstName} ${a.lastName}`;
          second = `${b.firstName} ${b.lastName}`;
          break;
        case 'email':
          first = a.emailAddresses[0]?.emailAddress || '';
          second = b.emailAddresses[0]?.emailAddress || '';
          break;
        case 'role':
          first = a.publicMetadata?.role || '';
          second = b.publicMetadata?.role || '';
          break;
        case 'status':
          first = a.publicMetadata?.status || '';
          second = b.publicMetadata?.status || '';
          break;
        case 'isProfileComplete':
          first = a.publicMetadata?.isProfileComplete || false;
          second = b.publicMetadata?.isProfileComplete || false;
          break;
        default:
          first = '';
          second = '';
      }

      if (typeof first === 'string' && typeof second === 'string') {
        const cmp = first.localeCompare(second);
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      } else {
        const cmp = first < second ? -1 : first > second ? 1 : 0;
        return sortDescriptor.direction === "descending" ? -cmp : cmp;
      }
    });
  }, [usersWithOptimisticUpdates, hasSearchFilter, filterValue, sortDescriptor.column, sortDescriptor.direction]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end) || [];
  }, [filteredItems, page]);

  const topContent = useMemo(() => {
    return (
      <div className="flex w-full gap-2">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Buscar usuarios..."
          startContent={<IconSearch stroke={1.5} size={24} />}
          value={filterValue}
          onClear={() => onClear()}
          onValueChange={onSearchChange}
        />
        <Button
          color="primary"
          variant="flat"
          startContent={<IconRefresh stroke={1.5} size={20} />}
          onPress={fetchUsers}
          isLoading={loading}
        >
          Actualizar
        </Button>
      </div>
    );
  }, [filterValue, onClear, onSearchChange, fetchUsers, loading]);

  const updateUserRole = async (userId: string, role: 'admin' | 'profesional' | 'asesor') => {
    // Actualización optimista
    setOptimisticUpdates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], role }
    }));
    
    try {
      setUpdatingUsers(prev => ({ ...prev, [userId]: 'role' }));
      const response = await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role
        }),
      });

      if (!response.ok) {
        // Revertir actualización optimista si falla
        setOptimisticUpdates(prev => {
          const newState = { ...prev };
          if (newState[userId]) {
            delete newState[userId].role;
            if (Object.keys(newState[userId]).length === 0) {
              delete newState[userId];
            }
          }
          return newState;
        });
        throw new Error('Error al actualizar rol de usuario');
      }

      const updatedUser = await response.json();
      
      // Actualizar el usuario en el estado principal
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, publicMetadata: { ...user.publicMetadata, role } }
          : user
      ));

      toast.success("Rol de usuario actualizado exitosamente");
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error("Error al actualizar el rol de usuario");
    } finally {
      setUpdatingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      // Limpiar actualización optimista específica
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        if (newState[userId]) {
          delete newState[userId].role;
          if (Object.keys(newState[userId]).length === 0) {
            delete newState[userId];
          }
        }
        return newState;
      });
    }
  };

  const updateUserStatus = async (userId: string, newStatus: 'active' | 'waiting') => {
    // Actualización optimista
    setOptimisticUpdates(prev => ({
      ...prev,
      [userId]: { ...prev[userId], status: newStatus }
    }));

    try {
      setUpdatingUsers(prev => ({ ...prev, [userId]: 'status' }));
      
      const response = await fetch('/api/admin/update-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          status: newStatus
        }),
      });

      if (!response.ok) {
        // Revertir actualización optimista si falla
        setOptimisticUpdates(prev => {
          const newState = { ...prev };
          if (newState[userId]) {
            delete newState[userId].status;
            if (Object.keys(newState[userId]).length === 0) {
              delete newState[userId];
            }
          }
          return newState;
        });
        throw new Error('Error al actualizar usuario');
      }

      // Actualizar el usuario en el estado principal
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, publicMetadata: { ...user.publicMetadata, status: newStatus } }
          : user
      ));

      toast.success(`Usuario ${newStatus === 'active' ? 'aprobado' : 'desaprobado'} exitosamente`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Error al actualizar el usuario');
    } finally {
      setUpdatingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
      // Limpiar actualización optimista específica
      setOptimisticUpdates(prev => {
        const newState = { ...prev };
        if (newState[userId]) {
          delete newState[userId].status;
          if (Object.keys(newState[userId]).length === 0) {
            delete newState[userId];
          }
        }
        return newState;
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'secondary';
      case 'profesional': return 'success';
      case 'asesor': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'waiting': return 'warning';
      default: return 'default';
    }
  };

  return (
    <>
      <div className="container max-w-7xl w-11/12 mx-auto py-7 pb-24">
        <Table
          aria-label="users table"
          isHeaderSticky
          className='max-h-[78vh] h-auto'
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          topContent={topContent}
          bottomContent={
            pages > 1 ? (
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
            ) : null
          }
        >
          <TableHeader columns={headerColumns}>
            {(column) => (
              <TableColumn 
                key={column.uid} 
                allowsSorting={column.sortable} 
                align={column.uid === 'actions' ? 'center' : 'start'}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            isLoading={loading}
            loadingContent={<Spinner label="Cargando usuarios" />}
            items={items}
            emptyContent="No se encontraron usuarios"
          >
            {(user: ClerkUser) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>
                  {user.emailAddresses[0]?.emailAddress}
                </TableCell>
                <TableCell>
                  <div className="relative">
                    <Popover offset={10} placement="bottom">
                      <PopoverTrigger>
                        <Chip
                          size='md'
                          variant='bordered'
                          color={getRoleColor(user.publicMetadata?.role || '')}
                          endContent={
                            updatingUsers[user.id] === 'role' ? (
                              <Spinner size="sm" color="current" />
                            ) : (
                              <IconCaretDownFilled stroke={1} size={15} />
                            )
                          }
                          className={`cursor-pointer transition-all duration-200 ${
                            updatingUsers[user.id] === 'role' ? 'opacity-75 scale-95' : 'hover:scale-105'
                          }`}
                          isDisabled={updatingUsers[user.id] === 'role'}
                        >
                          {user.publicMetadata?.role || 'Sin definir'}
                        </Chip>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Listbox 
                          aria-label="Cambiar Rol"
                          onAction={(key) => updateUserRole(user.id, key as "admin" | "profesional" | "asesor")}
                          isDisabled={!!updatingUsers[user.id]}
                        >
                          <ListboxItem key="admin">Admin</ListboxItem>
                          <ListboxItem key="profesional">Profesional</ListboxItem>
                          <ListboxItem key="asesor">Asesor</ListboxItem>
                        </Listbox>
                      </PopoverContent>
                    </Popover>
                    {updatingUsers[user.id] === 'role' && (
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Chip
                    size='md'
                    variant='flat'
                    color={user.publicMetadata?.isProfileComplete ? 'success' : 'warning'}
                    startContent={
                      user.publicMetadata?.isProfileComplete
                        ? <IconCircleDashedCheck stroke={1.5} size={20} />
                        : <IconCircleDashedX stroke={1.5} size={20} />
                    }
                  >
                    {user.publicMetadata?.isProfileComplete ? 'Completo' : 'Incompleto'}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="relative flex items-center">
                    <Switch
                      isSelected={user.publicMetadata?.status === 'active'}
                      color="success"
                      size="sm"
                      onValueChange={(isSelected) => 
                        updateUserStatus(user.id, isSelected ? 'active' : 'waiting')
                      }
                      isDisabled={updatingUsers[user.id] === 'status'}
                      className={`transition-all duration-200 ${
                        updatingUsers[user.id] === 'status' ? 'opacity-50' : ''
                      }`}
                    />
                    {updatingUsers[user.id] === 'status' && (
                      <div className="absolute -right-8">
                        <Spinner size="sm" color="success" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell align='center'>
                  <div className='flex items-center justify-center gap-2'>
                    <Tooltip content="Eliminar" color="danger">
                      <IconTrashX 
                        className={`cursor-pointer transition-all duration-200 ${
                          !!updatingUsers[user.id] 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-110 hover:text-red-600'
                        }`}
                        stroke={2} 
                        color={updatingUsers[user.id] ? 'gray' : 'red'} 
                        size={20} 
                        onClick={() => !updatingUsers[user.id] && userActions('delete', user)}
                      />
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
              <ModalHeader className='flex justify-center'>
                {docValues.action} usuario
              </ModalHeader>
              <ModalBody className='text-center'>
                ¿Está seguro que desea eliminar el usuario {docValues.user?.emailAddresses[0]?.emailAddress}?
                <br />
                <span className="text-red-500 text-sm mt-2">Esta acción no se puede deshacer.</span>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button 
                  color="danger" 
                  onPress={() => {
                    docValues.callback();
                    onClose();
                  }}
                >
                  Eliminar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}