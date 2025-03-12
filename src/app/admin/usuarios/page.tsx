'use client'
import { Input, Pagination, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, SortDescriptor } from '@heroui/react';
import { IconSearch } from '@tabler/icons-react';
import { getApp } from 'firebase/app';
import { getFirestore, collection, DocumentData, doc, updateDoc } from 'firebase/firestore';
import { useCallback, useMemo, useState } from "react";
import { useCollection } from 'react-firebase-hooks/firestore';
import { toast } from 'sonner';


const headerColumns = [
  { name: "NOMBRE", uid: "name", sortable: true },
  { name: "EMAIL", uid: "email", sortable: true },
  { name: "ROL", uid: "role", sortable: true },
  { name: "STATUS", uid: "approved", sortable: true },
  // { name: "ACCIONES", uid: "actions" },
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
  const rowsPerPage = 20;
  const hasSearchFilter = Boolean(filterValue);

  let pages = 0;

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

    return filteredUsers;
  }, [value?.docs, hasSearchFilter, filterValue]);

  if (filteredItems.length) {
    pages = Math.ceil(filteredItems.length / rowsPerPage);
  }

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end) || [];
  }, [filteredItems, page]);

  const sortedItems = useMemo(() => {
    return [...(items || [])].sort((a: DocumentData, b: DocumentData) => {
      a = a.data();
      b = b.data();
      const first = a[sortDescriptor.column] as number;
      const second = b[sortDescriptor.column] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items, filterValue]);


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
    </div>
  }, [filterValue, onClear, onSearchChange])

  const updateUser = async (id: string, status: boolean) => {
    try {
      const userRef = doc(getFirestore(getApp()), 'users', id);
      await updateDoc(userRef, { approved: status });
    } catch (error) {
      toast.error("Error al actualizar el usuario");
    }
  }

  return (
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
            <TableColumn key={column.uid} allowsSorting={column.sortable}>
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
          items={sortedItems}
        >
          {(doc: DocumentData) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.data()?.name}</TableCell>
              <TableCell>{doc.data()?.email}</TableCell>
              <TableCell>{doc.data()?.role}</TableCell>
              <TableCell>
                <Switch
                  isSelected={doc.data()?.approved}
                  color="success"
                  size="sm"
                  onValueChange={
                    (value: boolean) => updateUser(doc.id, value)
                  }
                />
                {doc.data()?.status}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}