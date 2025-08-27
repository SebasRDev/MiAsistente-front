// app/api/user/update-profile/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  console.log(req);
  try {
    const { userId } = await auth()
    console.log(userId);
    
    if (!userId) {
      return NextResponse.json({ 
        error: 'No autorizado' 
      }, { status: 401 })
    }

    const { firstName, lastName, publicMetadata } = await req.json()

    // Validar datos requeridos
    if (!firstName || !lastName) {
      return NextResponse.json({
        error: 'Nombre y apellido son requeridos'
      }, { status: 400 })
    }

    // Obtener usuario actual para preservar metadata existente
    const clerk = await clerkClient();
    const currentUser = await clerk.users.getUser(userId);
    
    // Combinar metadata existente con nueva metadata
    const updatedMetadata = {
      ...currentUser.publicMetadata,
      ...publicMetadata,
      updatedAt: new Date().toISOString()
    }

    // Actualizar usuario en Clerk
    await clerk.users.updateUser(userId, {
      firstName,
      lastName,
      publicMetadata: updatedMetadata
    })

    // Obtener usuario actualizado para confirmar cambios
    const updatedUser = await clerk.users.getUser(userId)
    console.log('updated User: ', updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.emailAddresses[0]?.emailAddress,
        imageUrl: updatedUser.imageUrl,
        publicMetadata: updatedUser.publicMetadata
      }
    })
    
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}