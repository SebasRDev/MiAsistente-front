'use server';

import { cookies } from 'next/headers';

export async function createSession(userId: string) {
  const cookieStore = await cookies();

  // Almacenamos el ID del usuario como la sesión
  // No almacenamos el idToken completo por seguridad
  cookieStore.set('user-session', userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 24 horas
    path: '/',
  });
}

export async function removeSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user-session');
}
