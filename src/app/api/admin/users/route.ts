// app/api/admin/users/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar que el usuario sea admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    
    if (currentUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener todos los usuarios
    const users = await clerk.users.getUserList({
      limit: 500, // Ajustar según necesidades
      orderBy: '-created_at'
    })

    const formattedUsers = users.data.map(user => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddresses: user.emailAddresses.map(email => ({
        emailAddress: email.emailAddress,
        id: email.id
      })),
      imageUrl: user.imageUrl,
      publicMetadata: user.publicMetadata || {},
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: users.totalCount
    })
    
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}