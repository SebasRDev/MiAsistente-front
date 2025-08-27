// app/api/webhooks/clerk/route.ts
import { WebhookEvent, clerkClient } from '@clerk/nextjs/server'
import { headers } from 'next/headers'
import { Webhook } from 'svix'

export async function POST(req: Request) {
  // Obtener el secret del webhook desde variables de entorno
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Obtener headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // Si no hay headers, error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Obtener el body
  const payload = await req.text()
  const body = JSON.parse(payload)

  // Crear nueva instancia de Svix con el secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verificar payload con headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Obtener ID y tipo de evento
  const { id } = evt.data
  const eventType = evt.type

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.log('Webhook body:', body)

  // Manejar el evento user.created
  if (eventType === 'user.created') {
    try {
      // Configurar metadatos para nuevos usuarios
      const clerk = await clerkClient();
      await clerk.users.updateUserMetadata(evt.data.id!, {
        publicMetadata: {
          role: 'profesional', // Rol por defecto
          status: 'waiting',
          isProfileComplete: false,
          approved: false,
          createdAt: new Date().toISOString()
        }
      })

      console.log(`User ${evt.data.id} configured with pending role`)
      
      // Opcional: Enviar notificación a administradores
      // await notifyAdminsNewUser(evt.data)
      
    } catch (error) {
      console.error('Error updating user metadata:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  return new Response('', { status: 200 })
}

// Función opcional para notificar administradores
async function notifyAdminsNewUser(userData: any) {
  try {
    // Obtener todos los usuarios con rol admin
    const clerk = await clerkClient();
    const adminUsersResponse = await clerk.users.getUserList({
      query: 'public_metadata.role:admin'
    })
    const adminUsers = adminUsersResponse.data

    // Aquí puedes implementar la lógica de notificación
    // Por ejemplo, enviar email, notificación push, etc.
    console.log(`Notifying ${adminUsers.length} admins about new user: ${userData.email_addresses[0]?.email_address}`)
    
  } catch (error) {
    console.error('Error notifying admins:', error)
  }
}