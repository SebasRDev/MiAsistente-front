// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('Middleware ejecutándose');

  // Inicializar la respuesta que eventualmente devolveremos
  const response = NextResponse.next({
    request,
  });

  // Obtener la cookie de sesión
  const sessionCookie = request.cookies.get('user-session')?.value;

  // Si no hay cookie de sesión y no estamos en la página principal, redirigir al login
  if (sessionCookie === undefined && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Si hay una cookie de sesión, pasamos el ID de usuario en los headers
  if (sessionCookie) {
    // No verificamos el token aquí, solo lo pasamos al context
    request.headers.set('x-user-id', sessionCookie);
  }

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
