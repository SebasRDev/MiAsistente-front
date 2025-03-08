// 'use client'


// import { Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, } from '@heroui/react';
// import { User } from 'firebase/auth';
// import { useEffect, useState } from "react";

// const headerColumns = [
//   { name: "NAME", uid: "name", sortable: true },
//   { name: "EMAIL", uid: "email", sortable: true },
//   { name: "STATUS", uid: "status", sortable: true },
//   { name: "ACCIONES", uid: "actions" },
// ];

// export default function AdminUsers() {
//   const [usersList, setUsersList] = useState<User[] | []>([]);

//   useEffect(() => {
    
//   }, []);

//   return (
//     <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
//       <Table aria-label="users table">
//         <TableHeader>
//           {headerColumns.map((column) => (
//             <TableColumn key={column.uid}>
//               {column.name}
//               {column.sortable && (
//                 <span className="sr-only">Sort by {column.name}</span>
//               )}
//             </TableColumn>
//           ))}
//         </TableHeader>
//         <TableBody>
//           {usersList.map(({ email, user_metadata, id }) => (
//             <TableRow key={id}>
//               <TableCell>{user_metadata?.name ||
//                 '-'}</TableCell>
//               <TableCell>{email}</TableCell>
//               <TableCell>
//                 <Switch
//                   isSelected={user_metadata?.status === 'active'}
//                   color="success"
//                   size="sm"
//                   onValueChange={
//                     (value: boolean) => {
//                       updateUser(id, { user_metadata: { status: value ? 'active' : 'inactive' } });
//                     }
//                   }
//                 />
//               </TableCell>
//               <TableCell>acciones</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }