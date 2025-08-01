// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Lista de todas las rutas API conocidas
const knownApiPaths = [
  '/api/ipc',
  '/api/emae',
  '/api/dollar',
  '/api/labor-market',
  '/api/poverty',
  '/api/calendar',
  '/api/riesgo-pais',
  '/api/stats',
  '/api/not-found',
  '/api-docs',
  '/api/documentacion',
  '/api/contact',
  '/api/newsletter/subscribe',
  '/api/cron/update-indec-data',
  '/api/cron/update-dollar',
  '/api/cron/update-labor-market',
  '/api/cron/update-embi',
  '/api/cron/update-poverty',

  '/api/webhook/clerk',
  '/api/user/api-key',
  '/api/user/favorites',
  '/api/user/alerts',
  '/api/admin/sync-users',
  '/api/admin/simple-sync',
  '/api/admin/clerk-count',
  '/api/admin/compare-users',
  '/api/test/webhook'
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

// Función para verificar si es una ruta API conocida
const isKnownApiPath = (pathname: string) => {
  return knownApiPaths.some(path => 
    pathname === path || 
    pathname.startsWith(`${path}/`)
  );
};

export default clerkMiddleware(async (auth, request: NextRequest) => {
  try {
    const session = await auth();
    const userId = session?.userId;
    const pathname = request.nextUrl.pathname;
    
    // Manejar rutas API desconocidas
    if (pathname.startsWith('/api')) {
      // Si no es una ruta conocida, redirigir a not-found
      if (!isKnownApiPath(pathname)) {
        return NextResponse.rewrite(new URL('/api/not-found', request.url));
      }
    }

    // Verificar autenticación para rutas protegidas
    if (isProtectedRoute(pathname)) {
      if (!userId) {
        // Si es una ruta de API, devolver 401
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
          );
        }
        
        // Si es una página, redirigir a sign-in
        const signInUrl = new URL('/sign-in', request.url);
        signInUrl.searchParams.set('redirect_url', pathname);
        return NextResponse.redirect(signInUrl);
      }
    }

    return NextResponse.next();
  } catch (error) {
    // En caso de error, permitir que la request continúe
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Coincidir con todas las rutas excepto archivos estáticos
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Siempre ejecutar para rutas API
    '/(api|trpc)(.*)',
  ],
};