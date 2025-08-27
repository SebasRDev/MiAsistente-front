// app/api/admin/update-user-role/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { userId, role } = await req.json()

    if (!userId || !role) {
      return NextResponse.json({
        error: 'userId y role son requeridos'
      }, { status: 400 })
    }

    if (!['admin', 'profesional', 'asesor'].includes(role)) {
      return NextResponse.json({
        error: 'role debe ser admin, profesional o asesor'
      }, { status: 400 })
    }

    // Verificar que el usuario actual sea admin
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(currentUserId)
    
    if (currentUser.publicMetadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Obtener usuario a actualizar
    const targetUser = await clerk.users.getUser(userId)
    
    // Actualizar metadata del usuario - SOLO cambiar el rol, mantener el status actual
    const updatedMetadata = {
      ...targetUser.publicMetadata,
      role: role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: currentUserId,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUserId
    }

    await clerk.users.updateUser(userId, {
      publicMetadata: updatedMetadata
    })

    return NextResponse.json({
      success: true,
      message: `Rol actualizado a ${role} correctamente`
    })
    
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}