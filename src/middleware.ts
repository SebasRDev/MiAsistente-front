// middleware.ts
import { clerkClient, clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Rutas públicas que no requieren autenticación
const isPublicRoute = createRouteMatcher([
  '/', 
  '/terminos-y-condiciones', 
  '/sw.js', 
  '/manifest.json',
  '/api/webhooks/clerk' // Webhook de Clerk
]);

// APIs que requieren autenticación pero NO redirección
const isProtectedApiRoute = createRouteMatcher([
  '/api/user(.*)',
  '/api/admin(.*)'
]);

// Rutas solo para admins (páginas)
const isAdminPageRoute = createRouteMatcher([
  '/admin(.*)'
]);

// Rutas para usuarios en waiting room
const isWaitingRoomRoute = createRouteMatcher(['/waiting-room']);

// Rutas para usuarios activos (páginas)
const isUserPageRoute = createRouteMatcher([
  '/productos(.*)',
  '/perfil(.*)',
  '/dashboard(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  
  // Si la ruta es pública, permitir acceso
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Si no hay usuario autenticado, proteger la ruta
  if (!userId) {
    if (isProtectedApiRoute(req)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return auth.redirectToSignIn();
  }

  let userRole: string = 'pending';
  let userStatus: string = 'waiting';
  let isProfileComplete: boolean = false;

  try {
    // Obtener metadata de sessionClaims
    const publicMetadata = sessionClaims?.publicMetadata || {};
    
    userRole = publicMetadata.role as string || 'pending';
    userStatus = publicMetadata.status as string || 'waiting';
    isProfileComplete = publicMetadata.isProfileComplete as boolean || false;

    // Si no hay metadata en sessionClaims, obtener usuario completo
    if (!publicMetadata.role) {
      console.log('Fetching user metadata from Clerk...');
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      
      userRole = user.publicMetadata?.role as string || 'pending';
      userStatus = user.publicMetadata?.status as string || 'waiting';
      isProfileComplete = user.publicMetadata?.isProfileComplete as boolean || false;
    }
    
  } catch (error) {
    console.error('Error obteniendo metadata del usuario:', error);
    userRole = 'pending';
    userStatus = 'waiting';
    isProfileComplete = false;
  }

  console.log(`Route: ${req.nextUrl.pathname}, User: ${userId}, Role: ${userRole}, Status: ${userStatus}, ProfileComplete: ${isProfileComplete}`);

  // Manejar APIs protegidas - SOLO verificar autenticación, NO redirigir
  if (isProtectedApiRoute(req)) {
    // Para APIs de admin, verificar rol
    if (req.nextUrl.pathname.startsWith('/api/admin/') && userRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin required' }, { status: 403 });
    }
    
    // Para otras APIs de usuario, permitir acceso
    return NextResponse.next();
  }

  // Manejar páginas de admin
  if (isAdminPageRoute(req)) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
    return NextResponse.next();
  }

  // Manejar waiting room
  if (isWaitingRoomRoute(req)) {
    // Solo usuarios pending/waiting pueden acceder a waiting room
    if (userStatus === 'waiting' || userRole === 'pending') {
      return NextResponse.next();
    }
    // Si ya fue aprobado, redirigir según perfil
    if (!isProfileComplete) {
      return NextResponse.redirect(new URL('/perfil', req.url));
    }
    return NextResponse.redirect(new URL('/productos', req.url));
  }

  // Si el usuario está en waiting room, redirigir allí (excepto si ya está)
  if (userStatus === 'waiting' || userRole === 'pending') {
    if (!isWaitingRoomRoute(req)) {
      return NextResponse.redirect(new URL('/waiting-room', req.url));
    }
  }

  // Manejar páginas de usuario activo
  if (isUserPageRoute(req)) {
    // Si el usuario no está activo, enviar a waiting room
    if (userStatus !== 'active') {
      return NextResponse.redirect(new URL('/waiting-room', req.url));
    }
    
    // Si está activo pero no completó perfil, ir a perfil
    if (!isProfileComplete && !req.nextUrl.pathname.startsWith('/perfil')) {
      return NextResponse.redirect(new URL('/perfil', req.url));
    }
    
    return NextResponse.next();
  }

  // Para rutas no categorizadas
  if (userStatus === 'active') {
    return NextResponse.next();
  }

  // Por defecto, redirigir según estado del usuario
  if (userStatus === 'waiting' || userRole === 'pending') {
    return NextResponse.redirect(new URL('/waiting-room', req.url));
  }

  return NextResponse.redirect(new URL('/perfil', req.url));
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};