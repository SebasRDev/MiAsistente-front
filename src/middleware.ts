// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Inicializar la respuesta que eventualmente devolveremos
  const response = NextResponse.next({
    request,
  });

  // Obtener la cookie de sesión
  const sessionCookie = request.cookies.get('user-session')?.value;

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/', '/terminos-y-condiciones', '/sw.js', "/manifest.json"];
  const isPublicRoute = publicRoutes.includes(request.nextUrl.pathname);

  // Si no hay cookie de sesión y no estamos en una ruta pública, redirigir al inicio
  if (sessionCookie === undefined && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Si hay una cookie de sesión, pasamos el ID de usuario en los headers
  if (sessionCookie) {
    // No verificamos el token aquí, solo lo pasamos al context
    request.headers.set('x-user-id', sessionCookie);
  }

  // Si hay una cookie de sesión y estamos en la página principal, redirigir a productos
  if (sessionCookie && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/productos';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
