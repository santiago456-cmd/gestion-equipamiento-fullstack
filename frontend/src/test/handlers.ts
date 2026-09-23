// src/test/handlers.ts
import { http, HttpResponse } from "msw";
import type {
  Solicitud,
  Equipo,
  HistorialRow,
  ResumenDashboard,
} from "../types/solicitud";

const baseURL = "http://localhost:3000/api";

export const mockSolicitudes: Solicitud[] = [
  {
    id: 1,
    estado: "pendiente",
    equipo: {
      id: 10,
      nombre: "Notebook Dell",
      categoria: "Hardware Computacional",
      codigoInventario: "INV-001",
    },
    solicitante: { id: 2, nombre: "Lucas Fernández", email: "lucas@dds.com" },
    fechaRetiro: "2026-08-20",
    fechaDevolucion: "2026-08-25",
    motivo: "Presentación en evento externo",
  },
];

export const mockEquipos: Equipo[] = [
  {
    id: 10,
    nombre: "Notebook Dell",
    categoria: "Hardware Computacional",
    codigoInventario: "INV-001",
  },
  {
    id: 11,
    nombre: "Proyector Epson",
    categoria: "Presentaciones",
    codigoInventario: "INV-002",
  },
];

export const mockHistorial: HistorialRow[] = [
  {
    id: 1,
    fechaHora: "2026-08-15T10:00:00Z",
    usuario: { nombre: "Lucas Fernández" },
    accion: "creacion",
    valorNuevo: JSON.stringify({ estado: "pendiente" }),
  },
];

export const mockResumen: ResumenDashboard = {
  pendientes: 3,
  aprobadas: 5,
  vencidas: 1,
  equiposDisponibles: 12,
  equiposPorCategoria: [{ categoria: "Hardware Computacional", total: 4 }],
  solicitudesRecientes: mockSolicitudes,
};

export const handlers = [
  // --- Solicitudes: listado y detalle ---
  http.get(`${baseURL}/solicitudes`, () => {
    return HttpResponse.json({
      data: mockSolicitudes,
      totalItems: mockSolicitudes.length,
      page: 1,
      limit: 5,
    });
  }),

  http.get(`${baseURL}/solicitudes/dashboard/resumen`, () => {
    return HttpResponse.json({ data: mockResumen });
  }),

  http.get(`${baseURL}/solicitudes/:id/historial`, () => {
    return HttpResponse.json({ data: mockHistorial });
  }),

  http.get(`${baseURL}/solicitudes/:id`, ({ params }) => {
    const solicitud = mockSolicitudes.find((s) => String(s.id) === params.id);
    if (!solicitud) {
      return HttpResponse.json(
        { ok: false, error: "No encontrada" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ data: solicitud });
  }),

  // --- Solicitudes: creación y edición ---
  http.post(`${baseURL}/solicitudes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: 99, estado: "pendiente", ...body },
    });
  }),

  http.put(`${baseURL}/solicitudes/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: Number(params.id), estado: "pendiente", ...body },
    });
  }),

  // --- Solicitudes: transiciones de estado ---
  http.patch(`${baseURL}/solicitudes/:id/aprobar`, ({ params }) =>
    HttpResponse.json({ data: { id: Number(params.id), estado: "aprobada" } }),
  ),
  http.patch(`${baseURL}/solicitudes/:id/rechazar`, ({ params }) =>
    HttpResponse.json({ data: { id: Number(params.id), estado: "rechazada" } }),
  ),
  http.patch(`${baseURL}/solicitudes/:id/cancelar`, ({ params }) =>
    HttpResponse.json({ data: { id: Number(params.id), estado: "cancelada" } }),
  ),
  http.patch(`${baseURL}/solicitudes/:id/devolver`, ({ params }) =>
    HttpResponse.json({ data: { id: Number(params.id), estado: "devuelta" } }),
  ),

  // --- Equipos ---
  http.get(`${baseURL}/equipos`, () => {
    return HttpResponse.json({ data: mockEquipos });
  }),

  // --- Auth ---
  http.post(`${baseURL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "carla@dds.com" && body.password === "usuario123") {
      return HttpResponse.json({
        ok: true,
        message: "Inicio de sesion exitoso",
        usuario: {
          id: 2,
          nombre: "Carla Gómez",
          email: "carla@dds.com",
          rol: "usuario",
        },
      });
    }
    return HttpResponse.json(
      { ok: false, error: "Credenciales inválidas" },
      { status: 401 },
    );
  }),

  http.get(`${baseURL}/auth/confirmar/:token`, ({ params }) => {
    if (params.token === "token-valido") {
      return HttpResponse.json({
        ok: true,
        mensaje: "Cuenta confirmada exitosamente. Ya podes iniciar sesion.",
      });
    }
    return HttpResponse.json(
      { ok: false, error: "El enlace de confirmacion es invalido o expiro." },
      { status: 400 },
    );
  }),

  http.post(`${baseURL}/auth/recuperar-contrasena`, () => {
    return HttpResponse.json({
      ok: true,
      message:
        "Si el correo electrónico está registrado, vas a recibir un enlace para restablecer tu contraseña.",
    });
  }),

  http.post(`${baseURL}/auth/restablecer-contrasena`, async ({ request }) => {
    const body = (await request.json()) as {
      token: string;
      nuevaContrasena: string;
    };
    if (body.token === "token-valido") {
      return HttpResponse.json({
        ok: true,
        message: "Contraseña actualizada exitosamente.",
      });
    }
    return HttpResponse.json(
      { ok: false, error: "El enlace de recuperacion es invalido o expiro." },
      { status: 400 },
    );
  }),

  http.post(`${baseURL}/auth/logout`, () => {
    return HttpResponse.json({
      ok: true,
      message: "Sesion cerrada exitosamente.",
    });
  }),

  http.post(`${baseURL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    return HttpResponse.json({
      ok: true,
      message: "Usuario registrado exitosamente.",
      data: { id: 3, email: body.email },
    });
  }),

  http.get(`${baseURL}/auth/me`, () => {
    const stored = localStorage.getItem("usuario");
    if (!stored) {
      return HttpResponse.json({ ok: false }, { status: 401 });
    }
    return HttpResponse.json({ ok: true, usuario: JSON.parse(stored) });
  }),

  http.patch(`${baseURL}/usuarios/me`, async ({ request }) => {
    const body = (await request.json()) as { nombre: string };
    const stored = localStorage.getItem("usuario");
    const usuarioActual = stored
      ? JSON.parse(stored)
      : { id: 2, email: "carla@dds.com", rol: "usuario" };
    return HttpResponse.json({
      ok: true,
      message: "Perfil actualizado exitosamente.",
      data: { ...usuarioActual, nombre: body.nombre },
    });
  }),

  http.post(`${baseURL}/usuarios/me/email`, () => {
    return HttpResponse.json({
      ok: true,
      message:
        "Revisá tu nuevo correo electrónico para confirmar el cambio. El enlace es válido por 2 horas.",
    });
  }),

  http.get(
    `${baseURL}/usuarios/confirmar-cambio-email/:token`,
    ({ params }) => {
      if (params.token === "token-valido") {
        return HttpResponse.json({
          ok: true,
          mensaje: "Correo electrónico actualizado exitosamente.",
        });
      }
      return HttpResponse.json(
        { ok: false, error: "El enlace es invalido o expiro." },
        { status: 400 },
      );
    },
  ),

  http.post(`${baseURL}/usuarios/me/password`, async ({ request }) => {
    const body = (await request.json()) as {
      passwordActual: string;
      passwordNueva: string;
    };
    if (body.passwordActual !== "usuario123") {
      return HttpResponse.json(
        { ok: false, error: "La contraseña actual es incorrecta." },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      ok: true,
      message: "Contraseña actualizada exitosamente.",
    });
  }),

  http.post(`${baseURL}/auth/logout`, () => {
    return HttpResponse.json({
      ok: true,
      message: "Sesion cerrada exitosamente.",
    });
  }),
];
