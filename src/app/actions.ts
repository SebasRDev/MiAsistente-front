'use server'

import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:skhcolombia.dev@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

// Define the correct type for web-push library
interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

let subscription: WebPushSubscription | null = null

export async function subscribeUser(sub: PushSubscription) {
  // Convert browser PushSubscription to web-push compatible format
  const webPushSub: WebPushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.getKey('p256dh') ? Buffer.from(sub.getKey('p256dh')!).toString('base64') : '',
      auth: sub.getKey('auth') ? Buffer.from(sub.getKey('auth')!).toString('base64') : ''
    }
  };
  
  subscription = webPushSub;
  // In a production environment, you would want to store the subscription in a database
  // For example: await db.subscriptions.create({ data: webPushSub })
  return { success: true }
}

export async function unsubscribeUser() {
  subscription = null
  // In a production environment, you would want to remove the subscription from the database
  // For example: await db.subscriptions.delete({ where: { ... } })
  return { success: true }
}

export async function sendNotification(message: string) {
  if (!subscription) {
    throw new Error('No subscription available')
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Test Notification',
        body: message,
        icon: '/icon.png',
      })
    )
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error: 'Failed to send notification' }
  }
}