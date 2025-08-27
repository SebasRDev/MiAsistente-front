// app/api/admin/update-user-status/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId: currentUserId } = await auth()
    
    if (!currentUserId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { userId, status } = await req.json()

    if (!userId || !status) {
      return NextResponse.json({
        error: 'userId y status son requeridos'
      }, { status: 400 })
    }

    if (!['active', 'waiting'].includes(status)) {
      return NextResponse.json({
        error: 'status debe ser active o waiting'
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
    
    // Actualizar metadata del usuario - SOLO cambiar el status, mantener rol y role
    const updatedMetadata = {
      ...targetUser.publicMetadata,
      status: status,
      approved: status === 'active',
      ...(status === 'active' && {
        approvedAt: new Date().toISOString(),
        approvedBy: currentUserId
      }),
      ...(status === 'waiting' && {
        disapprovedAt: new Date().toISOString(),
        disapprovedBy: currentUserId
      }),
      updatedAt: new Date().toISOString()
    }

    await clerk.users.updateUser(userId, {
      publicMetadata: updatedMetadata
    })

    return NextResponse.json({
      success: true,
      message: `Usuario ${status === 'active' ? 'aprobado' : 'desaprobado'} correctamente`
    })
    
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}