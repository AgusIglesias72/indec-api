// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Lista de rutas API conocidas
const knownApiPaths = [
  '/api/ipc',
  '/api/emae',
  '/api/emae/latest',
  '/api/emae/metadata',
  '/api/emae/sectors',
  '/api/dollar',
  '/api/dollar/latest',
  '/api/dollar/metadata',
  '/api/labor-market',
  '/api/labor-market/latest',
  '/api/labor-market/metadata',
  '/api/calendar',
  '/api/not-found',
  '/api-docs',
  '/api/documentacion',
  '/api/stats',
  '/api/cron/update-indec-data',
  '/api/cron/update-dollar-data',
  '/api/cron/update-labor-market',
  '/api/cron/update-embi',
  '/api/riesgo-pais',
  '/api/contact',
  '/api/newsletter/subscribe',
  // Nuevas rutas para Clerk
  '/api/webhook/clerk',
  '/api/user/api-key',
  '/api/user/favorites',
  '/api/user/alerts'
];

// Rutas que requieren autenticación
const protectedRoutes = [
  '/profile',
  '/profile/(.*)',
  '/api/user/(.*)',
  '/api/favorites/(.*)',
  '/api/alerts/(.*)',
];

// Función para verificar si una ruta está protegida
const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some(route => {
    const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`);
    return regex.test(pathname);
  });
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const session = await auth();
  const userId = session?.userId;
  const pathname = request.nextUrl.pathname;
  
  // Primero, verificar si es una ruta API
  if (pathname.startsWith('/api')) {
    // Verificar si es una ruta API conocida
    const isKnownPath = knownApiPaths.some(path => 
      pathname === path || 
      pathname.startsWith(`${path}/`)
    );
    
    // Si no es una ruta conocida, redirigir a not-found
    if (!isKnownPath) {
      return NextResponse.rewrite(new URL('/api/not-found', request.url));
    }
  }

  // Verificar autenticación para rutas protegidas
  if (isProtectedRoute(pathname)) {
    if (!userId) {
      // Si es una ruta de API, devolver 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // Si es una página, redirigir a sign-in
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Coincidir con todas las rutas excepto archivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas API
    '/(api|trpc)(.*)',
  ],
};