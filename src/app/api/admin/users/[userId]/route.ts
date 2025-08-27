// app/api/admin/users/[userId]/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { userId } = params

    if (!userId) {
      return NextResponse.json({
        error: 'userId es requerido'
      }, { status: 400 })
    }

    // Verificar que el usuario actual sea admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(currentUserId)
    
    if (currentUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Evitar que el admin se elimine a sí mismo
    if (currentUserId === userId) {
      return NextResponse.json({
        error: 'No puedes eliminar tu propia cuenta'
      }, { status: 400 })
    }

    // Eliminar usuario
    await clerk.users.deleteUser(userId)

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado correctamente'
    })
    
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}