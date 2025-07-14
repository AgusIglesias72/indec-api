import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Lista de rutas API conocidas
  const knownPaths = [
    '/api/ipc',
    '/api/ipc/latest',
    '/api/ipc/metadata',
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
    '/api/newsletter/subscribe'

  ];
  
  // Verificar si la ruta comienza con /api pero no es una ruta conocida
  if (request.nextUrl.pathname.startsWith('/api')) {
    const isKnownPath = knownPaths.some(path => 
      request.nextUrl.pathname === path || 
      request.nextUrl.pathname.startsWith(`${path}/`)
    );
    
    if (!isKnownPath) {
      return NextResponse.rewrite(new URL('/api/not-found', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*']
};