# API de Indicadores Económicos INDEC

Una API moderna para acceder a indicadores económicos de Argentina, proporcionados por el Instituto Nacional de Estadística y Censos (INDEC).

## 🚀 Características

- **Datos del EMAE**: Serie completa del Estimador Mensual de Actividad Económica
- **EMAE por Actividad**: Datos desagregados por sector económico
- **Actualizaciones Automáticas**: Cron jobs programados para mantener datos actualizados
- **Exportación Flexible**: Resultados disponibles en formato JSON o CSV
- **Filtrado Avanzado**: Búsqueda por fecha, sector y más
- **Documentación Completa**: Guías detalladas para cada endpoint

## 📋 Requisitos

- Node.js 18.x o superior
- Base de datos Supabase
- Cuenta en Vercel (para deploy)

## 🛠️ Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/api-indicadores-indec.git
   cd api-indicadores-indec
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   CRON_SECRET_KEY=your-cron-secret
   API_SECRET_KEY=your-api-secret
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 📚 Estructura del Proyecto

```
src/
├── app/
│   ├── api/                      # Endpoints de la API
│   │   ├── cron/                 # Cron jobs para actualización
│   │   ├── emae/                 # Endpoint de EMAE
│   │   └── emae-by-activity/     # Endpoint de EMAE por actividad
│   └── services/                 # Servicios
│       ├── analysis/             # Análisis estadístico
│       └── indec/                # Servicios para obtener datos del INDEC
├── components/                   # Componentes React
│   └── admin/                    # Componentes del panel de administración
├── lib/                          # Utilidades y librerías
├── types/                        # Definiciones de tipos TypeScript
└── docs/                         # Documentación
    └── api/                      # Documentación de la API
```

## 🔄 Cron Jobs

El proyecto incluye cron jobs para actualizar automáticamente los datos del INDEC:

- **Actualización Diaria**: Se ejecuta a las 8:00 AM para obtener datos nuevos
- **Panel de Administración**: Permite ejecutar actualizaciones manualmente

Para configurar los cron jobs, asegúrate de tener correctamente configurado el archivo `vercel.json`.

## 📊 Endpoints de la API

### EMAE General

```
GET /api/emae
```

Consulta la documentación completa en [docs/api/emae-api.md](docs/api/emae-api.md).

### EMAE por Actividad

```
GET /api/emae-by-activity
```

Consulta la documentación completa en [docs/api/emae-by-activity-api.md](docs/api/emae-by-activity-api.md).

## 💽 Base de Datos

Este proyecto utiliza Supabase como base de datos. La estructura incluye:

- **emae**: Tabla con datos del EMAE general
- **emae_by_activty**: Tabla con datos del EMAE por sector
- **cron_executions**: Registro de ejecuciones de cron jobs

Para configurar la base de datos, ejecuta las migraciones SQL incluidas en la carpeta `migrations/`.

## 🚀 Despliegue

Este proyecto está optimizado para desplegar en Vercel:

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno necesarias
3. Despliega la aplicación

## 📝 Contribuciones

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:

1. Crea un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva característica'`)
4. Sube tus cambios (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## 🙋 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio o contacta a los mantenedores.

---

Desarrollado con ❤️ usando Next.js, TypeScript y Supabase.