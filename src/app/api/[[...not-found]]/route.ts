import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    {
      error: 'Ruta no encontrada',
      message: 'La ruta solicitada no existe. Por favor, consulta la documentación en /documentacion para ver las rutas disponibles.',
      available_docs: '/documentacion',
      // Generate a list of available routes in the API
      available_routes: [
        {"api/emae": {
          "latest": "/api/emae/latest",
          "metadata": "/api/emae/metadata",
          "by-activity": "/api/emae/by-activity"
        }},
        {"api/ipc": {
          "latest": "/api/ipc/latest",
          "metadata": "/api/ipc/metadata",
          "by-activity": "/api/ipc/by-activity"
        }},
        {"api/calendar": {
          "latest": "/api/calendar/latest",
          "metadata": "/api/calendar/metadata",
          "by-activity": "/api/calendar/by-activity"
        }},
      ]
    },
    { status: 404 }
  );
}

export { GET as POST, GET as PUT, GET as DELETE, GET as PATCH }; 