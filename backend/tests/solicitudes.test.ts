import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import type { Server } from 'http'
import jwt from 'jsonwebtoken'
import { createApp } from '../src/app.js';
import { sequelize } from '../src/config/dataBase.js'; 
import { Equipo } from '../src/models/Equipo.js';
import { Solicitud } from '../src/models/Solicitud.js';

const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET || 'secreto_email_para_pruebas_456'

describe('Pruebas del Dominio de Solicitudes y Equipos', () => {
  let app: Express;
  let server: Server;
  let tokenAlumno: string;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(0);

    // 1. Registramos un usuario
    const registro = await request(app).post('/api/auth/register').send({
      email: 'alumno_test@test.com',
      password: 'Password123',
      nombre: 'Alumno Test',
      rol: 'usuario',
    });

    const usuarioId = registro.body.data.id;

    // 2. Simulamos el click en el mail de confirmación
    const confirmationToken = jwt.sign(
      { id: usuarioId, type: 'email-confirmation' },
      JWT_EMAIL_SECRET,
      { expiresIn: '24h' },
    );
    await request(app).get(`/api/auth/confirmar/${confirmationToken}`);

    // 3. Iniciamos sesión (ahora sí, con la cuenta ya confirmada)
    const login = await request(app).post('/api/auth/login').send({
      email: 'alumno_test@test.com',
      password: 'Password123',
    });

    tokenAlumno = login.body.token;
  });


  afterAll(async () => {
    await sequelize.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  // --- CAMINO NO FELIZ: Autenticación Ausente ---
  it('Debería rechazar el acceso a aprobar solicitudes si no se provee un token (401)', async () => {
    const res = await request(app)
      .patch('/api/solicitudes/1/aprobar')
      .send(); 

    expect(res.status).toBe(401);
  });

  // --- CAMINO NO FELIZ: Autorización Insuficiente ---
  it('Debería rechazar el acceso a aprobar solicitudes si el rol es Alumno (403)', async () => {
    const res = await request(app)
      .patch('/api/solicitudes/1/aprobar')
      .set('Authorization', `Bearer ${tokenAlumno}`) 
      .send();

    expect(res.status).toBe(403);
  });

  // --- CAMINO FELIZ: Listado y filtrado ---
  it('Debería listar las solicitudes aplicando filtros opcionales (200)', async () => {
    const res = await request(app)
      .get('/api/solicitudes?estado=pendiente&limit=10')
      .set('Authorization', `Bearer ${tokenAlumno}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });

  // --- CAMINO NO FELIZ: Recurso Inexistente ---
  it('Debería devolver error al buscar el detalle de una solicitud que no existe (404)', async () => {
    const res = await request(app)
      .get('/api/solicitudes/99999') 
      .set('Authorization', `Bearer ${tokenAlumno}`);

    expect(res.status).toBe(404);
  });

  // --- CAMINO NO FELIZ: Validación de Fechas Inconsistentes ---
  it('Debería procesar la validación al intentar crear una solicitud con fechas inconsistentes (400)', async () => {
    const res = await request(app)
      .post('/api/solicitudes')
      .set('Authorization', `Bearer ${tokenAlumno}`)
      .send({
        equipoId: 1,
        fechaRetiro: '2026-06-25',
        fechaDevolucion: '2026-06-20', 
        motivo: 'Práctica de laboratorio'
      });

    expect(res.status).toBe(400);
  });

  // --- CAMINO NO FELIZ: Transición de Estados Inválida ---
  it('Debería rechazar operaciones no permitidas según el estado de la solicitud, (404)', async () => {
    const res = await request(app)
      .patch('/api/solicitudes/999/devolver') 
      .set('Authorization', `Bearer ${tokenAlumno}`)
      .send();

    expect(res.status).toBe(404);
  });

  // --- CAMINO FELIZ: Creación Exitosa de Solicitud ---
it('Debería crear correctamente una solicitud válida (201)', async () => {

  // Creamos un equipo disponible para la prueba
  const equipo = await Equipo.create({
    codigoInventario: 'EQ-TEST-001',
    nombre: 'Notebook Test',
    categoria: 'Notebook',
    estado: 'disponible',
    requiereAutorizacion: false,
    ubicacion: 'Laboratorio de Informática'
  });

  const res = await request(app)
    .post('/api/solicitudes')
    .set('Authorization', `Bearer ${tokenAlumno}`)
    .send({
      equipoId: equipo.id,
      fechaRetiro: '2026-07-01',
      fechaDevolucion: '2026-07-05',
      motivo: 'Prueba automatizada'
    });

  expect(res.status).toBe(201);
  });

  // --- CAMINO FELIZ: Consulta de Detalle Existente ---
it('Debería obtener el detalle de una solicitud existente (200)', async () => {

  const equipo = await Equipo.create({
    codigoInventario: 'EQ-TEST-002',
    nombre: 'Proyector Test',
    categoria: 'Proyector',
    estado: 'disponible',
    requiereAutorizacion: false,
    ubicacion: 'Laboratorio de Informática'
  });

  const solicitud = await Solicitud.create({
    equipoId: equipo.id,
    usuarioId: 1,
    fechaRetiro: '2026-07-10',
    fechaDevolucion: '2026-07-12',
    motivo: 'Consulta de detalle',
    estado: 'pendiente'
  });

  const res = await request(app)
    .get(`/api/solicitudes/${solicitud.id}`)
    .set('Authorization', `Bearer ${tokenAlumno}`);

  expect(res.status).toBe(200)
  });

  // --- CAMINO NO FELIZ: Superposición de Fechas ---
it('Debería rechazar una solicitud cuando existe una reserva aprobada superpuesta (400)', async () => {

  const equipo = await Equipo.create({
    codigoInventario: 'EQ-TEST-003',
    nombre: 'Cámara Test',
    categoria: 'Multimedia',
    estado: 'disponible',
    requiereAutorizacion: false,
    ubicacion: 'Laboratorio de Informática'
  });

  await Solicitud.create({
    equipoId: equipo.id,
    usuarioId: 1,
    fechaRetiro: '2026-08-01',
    fechaDevolucion: '2026-08-10',
    motivo: 'Solicitud aprobada previa',
    estado: 'aprobada'
  });

  const res = await request(app)
    .post('/api/solicitudes')
    .set('Authorization', `Bearer ${tokenAlumno}`)
    .send({
      equipoId: equipo.id,
      fechaRetiro: '2026-08-05',
      fechaDevolucion: '2026-08-15',
      motivo: 'Solicitud superpuesta'
    });

  expect(res.status).toBe(400);

  });

  // --- CAMINO NO FELIZ: Devolución sobre Solicitud No Aprobada ---
it('Debería impedir devolver una solicitud que no fue aprobada (400)', async () => {

  const equipo = await Equipo.create({
    codigoInventario: 'EQ-TEST-004',
    nombre: 'Tablet Test',
    categoria: 'Tablet',
    estado: 'disponible',
    requiereAutorizacion: false,
    ubicacion: 'Laboratorio de Informática'
  });

  const solicitud = await Solicitud.create({
    equipoId: equipo.id,
    usuarioId: 1,
    fechaRetiro: '2026-09-01',
    fechaDevolucion: '2026-09-05',
    motivo: 'Solicitud pendiente',
    estado: 'pendiente'
  });

  const res = await request(app)
    .patch(`/api/solicitudes/${solicitud.id}/devolver`)
    .set('Authorization', `Bearer ${tokenAlumno}`)
    .send();

  expect(res.status).toBe(400);

  });

});