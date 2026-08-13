# EquiManage Pro — Frontend

Frontend refactorizado para conectar con el backend documentado en `tp.md`.

## Stack

- **React 18** + **Vite**
- **React Router v6** (`react-router-dom`) — rutas protegidas/públicas, navegación
- **React Hook Form** + **Zod** (`@hookform/resolvers/zod`) — validación de formularios
- **Axios** — cliente HTTP con interceptor de JWT y normalización de errores

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env y apuntar VITE_API_URL al backend (ej. http://localhost:3000/api)
npm run dev
```

## Estructura

```
src/
  api/              # Llamadas HTTP (axiosClient, authApi, equipoApi, solicitudApi)
  context/          # AuthContext (JWT, usuario, login/logout/register)
  routes/           # ProtectedRoute, PublicOnlyRoute
  schemas/          # Esquemas Zod para cada formulario
  components/
    layout/         # AppShell, Sidebar, TopBar
    ui/             # Button, Card, FormField, Avatar, StatusBadge, Pagination
    solicitudes/    # Componentes de dominio: filtros, tabla, info, historial, acciones por rol
    pages/          # Páginas (orquestan los componentes de arriba)
  styles/           # tokens.css, global.css
```

## Cumplimiento de `consignas.txt`

- **Login y registro**: `LoginPage`, `RegisterPage` (`/login`, `/registro`), validados con Zod.
- **Listado con filtros**: `SolicitudesListPage` + `SolicitudFilters` (estado, categoría, equipoId, rango de fechas) + `SolicitudTable` (paginación server-side vía `GET /api/solicitudes`).
- **Detalle en `/solicitudes/:id`**: `SolicitudDetailPage`, compone `SolicitudInfoCard` + `SolicitudHistorial` + `SolicitudAcciones`.
- **Alta/edición transaccional**: `NuevaSolicitudPage` (selección de equipo, período, motivo, `POST /api/solicitudes`) y `EditarSolicitudPage` (`PUT /api/solicitudes/:id`).
- **Acciones por rol**: `SolicitudAcciones` muestra Editar/Cancelar (dueño), Aprobar/Rechazar (admin, estado pendiente), Registrar Devolución (admin o dueño, estado aprobada).
- **Panel resumen**: `AdminResumenPage` (`/resumen`, `GET /api/solicitudes/dashboard/resumen`), restringido a `admin` (consistente con el backend, que también restringe este endpoint a `admin`).
- **Historial visible en el detalle**: `SolicitudHistorial` (`GET /api/solicitudes/:id/historial`).
- **Ruta comodín 404**: `NotFoundPage`, registrada como `path="*"` en `App.jsx`.
- **Capa de servicio con axios**: instancia única con `baseURL` (`axiosClient.js`), filtros vía `params`, body en POST/PUT/PATCH, header `Authorization: Bearer <token>` inyectado por interceptor, manejo de 401 limpiando sesión y normalización de errores del backend (`{ ok: false, error }`) a mensajes legibles.
- **Componentes separados**: tabla (`SolicitudTable`), filtros (`SolicitudFilters`), formulario (`NuevaSolicitudPage`/`EditarSolicitudPage`), detalle (`SolicitudInfoCard`), acciones por rol (`SolicitudAcciones`), resumen administrativo (`AdminResumenPage`).
- **Estados de carga/vacío/error/éxito**: implementados explícitamente en `SolicitudTable`, páginas de detalle/edición y formularios.
- **Contexto de sesión**: `AuthContext` (usuario, token, rol) persistido en `localStorage`.
- **Rutas protegidas en frontend**: `ProtectedRoute` / `PublicOnlyRoute` / `roles`; el backend es la fuente de verdad final (cada endpoint vuelve a validar `authMiddleware` + `checkRole`).
- **Validaciones repetidas**: esquemas Zod en frontend (UX) — el backend revalida todo como fuente de verdad.
- **Servicios axios separados por recurso**: `authApi`, `equipoApi`, `solicitudApi`, sin `fetch`/`axios` sueltos en componentes.

## Autenticación

- `POST /api/auth/register` → `RegisterPage`
- `POST /api/auth/login` → `LoginPage`, guarda `token` y `usuario` en `localStorage`
- El token se adjunta automáticamente vía `Authorization: Bearer <token>` en cada request
- `ProtectedRoute` redirige a `/login` si no hay sesión
- `ProtectedRoute roles={['admin']}` restringe `/resumen` solo a administradores
- `PublicOnlyRoute` redirige a `/solicitudes` si ya hay sesión activa (en `/login` y `/registro`)

## Rutas

| Ruta                       | Página                  | Acceso          |
|---------------------------|-------------------------|-----------------|
| `/login`                  | LoginPage               | público         |
| `/registro`               | RegisterPage            | público         |
| `/solicitudes`            | SolicitudesListPage     | autenticado     |
| `/solicitudes/nueva`      | NuevaSolicitudPage      | autenticado     |
| `/solicitudes/:id`        | SolicitudDetailPage     | autenticado     |
| `/solicitudes/:id/editar` | EditarSolicitudPage     | autenticado     |
| `/resumen`                | AdminResumenPage        | admin           |

## Endpoints del backend utilizados

- `GET /api/equipos?categoria=`
- `GET /api/solicitudes?estado=&equipoId=&categoria=&desde=&hasta=&page=&limit=`
- `GET /api/solicitudes/:id`
- `POST /api/solicitudes`
- `PUT /api/solicitudes/:id`
- `PATCH /api/solicitudes/:id/aprobar`
- `PATCH /api/solicitudes/:id/rechazar`
- `PATCH /api/solicitudes/:id/cancelar`
- `PATCH /api/solicitudes/:id/devolver`
- `GET /api/solicitudes/:id/historial`
- `GET /api/solicitudes/dashboard/resumen`

## Notas de refactor respecto al frontend original

- Se eliminó toda navegación simulada por estado (`useState` de "página actual") y se
  reemplazó por `react-router-dom` con rutas reales.
- Todos los formularios (`LoginPage`, `RegisterPage`, `NuevaSolicitudPage`,
  `EditarSolicitudPage`, modal de rechazo) usan `react-hook-form` + `zod` para
  validación declarativa y manejo de errores.
- `StatusBadge` se remapeó a los estados reales del modelo `Solicitud` del backend:
  `pendiente | aprobada | rechazada | cancelada | devuelta`, más un estado visual
  calculado `vencido` para solicitudes aprobadas cuya `fechaDevolucion` ya pasó.
- `FormField` se convirtió en `forwardRef` para soportar el spread de
  `register()` de react-hook-form.
- Las acciones de aprobar/rechazar/cancelar/devolver y la edición se habilitan
  según el rol del usuario (`admin`/dueño de la solicitud) y el `estado` actual,
  replicando las reglas de negocio del backend.
- Se añadió `AuthContext` con persistencia en `localStorage` y un interceptor de
  Axios que adjunta el JWT y limpia la sesión ante un `401`.
