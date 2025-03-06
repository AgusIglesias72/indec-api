import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'Ruta no encontrada',
      message: 'La ruta solicitada no existe. Por favor, consulta la documentación en /api-docs para ver las rutas disponibles.',
      available_docs: '/api-docs',
    },
    { status: 404 }
  );
}

export { GET as POST, GET as PUT, GET as DELETE, GET as PATCH }; 