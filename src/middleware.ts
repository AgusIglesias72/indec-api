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
    '/api/calendar',
    '/api/not-found',
    '/api-docs',
    '/api/stats',
    '/api/cron/update-indec-data'
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