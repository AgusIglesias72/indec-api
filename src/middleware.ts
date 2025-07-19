// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';
import { checkRateLimit } from './lib/rate-limit';

// Lista de rutas API públicas que necesitan rate limiting
const publicApiPaths = [
  '/api/ipc',
  '/api/emae',
  '/api/dollar',
  '/api/labor-market',
  '/api/calendar',
  '/api/riesgo-pais',
  '/api/stats',
];

// Lista de todas las rutas API conocidas
const knownApiPaths = [
  ...publicApiPaths,
  '/api/not-found',
  '/api-docs',
  '/api/documentacion',
  '/api/contact',
  '/api/newsletter/subscribe',
  '/api/cron/update-indec-data',
  '/api/cron/update-dollar-data',
  '/api/cron/update-labor-market',
  '/api/cron/update-embi',
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

// Rutas que NO necesitan rate limiting (webhooks, cron jobs, etc.)
const rateLimitExemptPaths = [
  '/api/cron/',
  '/api/webhook/',
  '/api/not-found',
  '/api-docs',
  '/api/documentacion',
];

// Función para verificar si una ruta está protegida
const isProtectedRoute = (pathname: string) => {
  return protectedRoutes.some(route => {
    const regex = new RegExp(`^${route.replace(/\(\.\*\)/g, '.*')}$`);
    return regex.test(pathname);
  });
};

// Función para verificar si una ruta necesita rate limiting
const needsRateLimit = (pathname: string) => {
  // No aplicar rate limit a rutas exentas
  if (rateLimitExemptPaths.some(path => pathname.startsWith(path))) {
    return false;
  }
  
  // Aplicar rate limit a todas las APIs públicas
  return publicApiPaths.some(path => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
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
    
    // Aplicar rate limiting si es necesario
    if (needsRateLimit(pathname)) {
      const rateLimitResult = await checkRateLimit(request);
      
      if (!rateLimitResult.success) {
        return new Response(
          JSON.stringify({ 
            error: rateLimitResult.error,
            limit: rateLimitResult.limit,
            remaining: rateLimitResult.remaining,
            reset: rateLimitResult.reset
          }),
          { 
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': rateLimitResult.limit.toString(),
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': rateLimitResult.reset.toISOString(),
            }
          }
        );
      }
      
      // Si pasa el rate limit, agregar los headers a la respuesta
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
      response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
      response.headers.set('X-RateLimit-Reset', rateLimitResult.reset.toISOString());
      
      // Continuar con el request pero con los headers de rate limit
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