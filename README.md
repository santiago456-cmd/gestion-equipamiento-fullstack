# Aspectos generales — EquiManage Pro

Este documento describe el paso a paso completo para levantar el **backend** y el
**frontend**

## Scripts Backend

| Script                  | Descripcion                                    |
| ----------------------- | ---------------------------------------------- |
| `npm start`             | Inicia el servidor en modo produccion          |
| `npm run dev`           | Inicia el servidor con hot-reload (`--watch`)  |
| `npm run init-db`       | Crea las tablas y carga datos iniciales        |
| `npm run init-db:force` | Elimina y recrea las tablas, luego carga datos |
| `npm run test`          | ejecuta los tests                              |

## Scripts Frontend

| Script        | Descripcion        |
| ------------- | ------------------ |
| `npm run dev` | Inicia el servidor |

### Inicio Base de datos

Si es la primera vez que levantás el proyecto, ejecutá el script de inicializacion antes de arrancar el servidor:

```bash
npm run init-db
```

Si necesitas resetear la base de datos a su estado inicial:

```bash
npm run init-db:force
```

## Levantar el backend

1. Ubicarte en la carpeta raíz del proyecto backend (la que contiene su `package.json`, `src/`, etc.).

2. Instalar dependencias:

   ```bash
   npm install
   ```

3. Crear el archivo `.env` en la raíz del backend con las siguientes variables

   ```env
   PORT=3000
   JWT_SECRET=ClaveSerguraYFuerte1234567890
   CORS_ORIGIN=http://localhost:5173
   ```

4. Iniciar el servidor:

   En modo de produccion:

   ```bash
   npm run start
   ```

   En modo de desarrollo:

   ```bash
   npm run dev
   ```

5. Verificar que el servidor esté arriba. Deberías ver en la consola algo como:

   ```
   🚀 api-solicitudes-equipamientos escuchando en http://localhost:3000
   ```

6. Probar el endpoint de salud desde el navegador o con `curl`:

   ```bash
   curl http://localhost:3000/api/health
   ```

   Respuesta esperada:

   ```json
   { "ok": true, "status": "ok", "app": "api-solicitudes-equipamientos" }
   ```

   ✅ Si ves esta respuesta, el backend está corriendo correctamente.

## Levantar el frontend

1. Abrir una **segunda terminal** (dejá el backend corriendo en la primera).

2. Ubicarte en la carpeta `frontend`.

3. Instalar dependencias:

   ```bash
   npm install
   ```

4. Crear el archivo `.env` a partir del ejemplo:

   ```env
   VITE_API_URL=http://localhost:3000/api
   ``

   ```

5. Iniciar el servidor:

   ```bash
   npm run dev
   ```

6. Abrir el navegador en la URL que indique la consola (`http://localhost:5173`).

   ✅ Al acceder a la URL, deberías ver la pantalla de **Login** de EquiManage Pro.

## Acceso a la aplicacion

Una vez levantados el back y el fornt podemos acceder a la app mediante alguno de los siguientes uausarios.

Usuario de admin
email: admin@dds.com
contrasenia: admin123

Usuarios comunes:
email: carla@dds.com
contrasenia: usuario123

      email: lucas@dds.com
      contrasenia: usuario123

## API Endpoints Principales

A modo de referencia rápida, estos son los endpoints expuestos por el backend:

- GET `/` — estado básico de la API (mensaje de bienvenida)
- GET `/api/health` — health check

Auth

- POST `/api/auth/register` — registrar usuario
- POST `/api/auth/login` — iniciar sesión (devuelve `token` y `usuario`)

Equipos

- GET `/api/equipos` — listar equipos (requiere autenticación). Opciones de filtrado en el frontend por `categoria`.

Solicitudes

- GET `/api/solicitudes` — listado paginado y filtrable (`estado`, `equipoId`, `categoria`, `desde`, `hasta`, `page`, `limit`)
- GET `/api/solicitudes/:id` — detalle de una solicitud
- POST `/api/solicitudes` — crear nueva solicitud (se crea como `pendiente`)
- PUT `/api/solicitudes/:id` — editar una solicitud (solo cuando esté en `pendiente`)
- GET `/api/solicitudes/dashboard/resumen` — resumen/KPIs (requiere rol `admin`)
- PATCH `/api/solicitudes/:id/cancelar` — cancelar solicitud
- PATCH `/api/solicitudes/:id/aprobar` — aprobar (roles `admin` o `encargado`)
- PATCH `/api/solicitudes/:id/rechazar` — rechazar (rol `admin`)
- PATCH `/api/solicitudes/:id/devolver` — procesar devolución
- GET `/api/solicitudes/:id/historial` — historial de cambios de la solicitud

---

## Rutas del Frontend (React Router)

Listado de rutas principales que utiliza la aplicación frontend:

- Públicas (redirigen a `/solicitudes` si ya hay sesión):
  - `/login` — pantalla de inicio de sesión (`LoginPage`)
  - `/registro` — pantalla de registro (`RegisterPage`)

- Protegidas (requieren sesión):
  - `/solicitudes` — listado paginado y filtros (`SolicitudesListPage`)
  - `/solicitudes/nueva` — formulario de creación de solicitud (`NuevaSolicitudPage`)
  - `/solicitudes/:id` — detalle de solicitud + historial + acciones (`SolicitudDetailPage`)
  - `/solicitudes/:id/editar` — edición de solicitud (solo `pendiente`) (`EditarSolicitudPage`)

- Rutas con permisos adicionales:
  - `/resumen` — dashboard administrativo / KPIs (solo `admin`) (`AdminResumenPage`)

- Otras:
  - `/` — redirige a `/solicitudes`
  - `*` — `NotFoundPage` (404)

---

## Estructura general de la aplicación

Resumen de carpetas y archivos principales:

- backend/
  - package.json
  - src/
    - app.js — entrada y montaje de rutas
    - config/ — configuración y conexión a BD
    - controllers/ — controladores por recurso (auth, solicitud, equipo)
    - routes/ — definición de rutas express
    - services/ — lógica de negocio
    - repositories/ — acceso a datos (Sequelize)
    - models/ — definiciones Sequelize y asociaciones
    - middlewares/ — auth, error handling, cors, roles
    - scripts/ — inicialización y seeders
    - tests/ — tests backend

- frontend/
  - package.json
  - src/
    - main.jsx / App.jsx — entry + rutas
    - api/ — wrappers para `axios` (`authApi`, `solicitudApi`, `equipoApi`)
    - components/ — UI y páginas:
      - pages/ — `LoginPage`, `RegisterPage`, `SolicitudesListPage`, `SolicitudDetailPage`, `NuevaSolicitudPage`, `EditarSolicitudPage`, `AdminResumenPage`, `NotFoundPage`
      - solicitudes/ — subcomponentes para listado, filtros, tabla, historial, acciones
      - layout/ — `AppShell`, `Sidebar`, `TopBar`
      - ui/ — componentes atómicos (Button, FormField, Card, etc.)
    - context/ — `AuthContext` (gestión de sesión)
    - routes/ — `ProtectedRoute`, `PublicOnlyRoute`
    - schemas/ — validaciones con Zod
    - styles/ — css global y tokens

-
