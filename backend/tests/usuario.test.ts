import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { Server } from 'http';
import { createApp } from '../src/app.js';
import { sequelize } from '../src/config/dataBase.js';

const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET || 'secreto_email_para_pruebas_456';

describe('Pruebas de Edición de Perfil de Usuario', () => {
  let app: Express;
  let server: Server;
  let token: string;
  let usuarioId: number;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(0);

    const registro = await request(app).post('/api/auth/register').send({
      email: 'perfil_test@test.com',
      password: 'Password123',
      nombre: 'Usuario Original',
      rol: 'usuario',
    });
    usuarioId = registro.body.data.id;

    const confirmationToken = jwt.sign(
      { id: usuarioId, type: 'email-confirmation' },
      JWT_EMAIL_SECRET,
      { expiresIn: '24h' },
    );
    await request(app).get(`/api/auth/confirmar/${confirmationToken}`);

    const login = await request(app).post('/api/auth/login').send({
      email: 'perfil_test@test.com',
      password: 'Password123',
    });
    token = login.body.token;
  });

  afterAll(async () => {
    await sequelize.close();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('Debería rechazar la edición de perfil sin token (401)', async () => {
    const res = await request(app).patch('/api/usuarios/me').send({ nombre: 'Nuevo Nombre' });
    expect(res.status).toBe(401);
  });

  it('Debería actualizar el nombre exitosamente (200)', async () => {
    const res = await request(app)
      .patch('/api/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Usuario Renombrado' });

    expect(res.status).toBe(200);
    expect(res.body.data.nombre).toBe('Usuario Renombrado');
  });

  it('Debería rechazar solicitar cambio a un email ya en uso (409)', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'otro_usuario@test.com',
      password: 'Password123',
      nombre: 'Otro Usuario',
      rol: 'usuario',
    });

    const res = await request(app)
      .post('/api/usuarios/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevoEmail: 'otro_usuario@test.com' });

    expect(res.status).toBe(409);
  });

  it('Debería solicitar el cambio de email exitosamente (200)', async () => {
    const res = await request(app)
      .post('/api/usuarios/me/email')
      .set('Authorization', `Bearer ${token}`)
      .send({ nuevoEmail: 'nuevo_correo@test.com' });

    expect(res.status).toBe(200);
  });

  it('Debería rechazar la confirmación con un token inválido (400)', async () => {
    const res = await request(app).get('/api/usuarios/confirmar-cambio-email/token-invalido');
    expect(res.status).toBe(400);
  });

  it('Debería confirmar el cambio de email y permitir login con el nuevo correo (200)', async () => {
    const emailChangeToken = jwt.sign(
      { id: usuarioId, type: 'email-change', nuevoEmail: 'confirmado@test.com' },
      JWT_EMAIL_SECRET,
      { expiresIn: '2h' },
    );

    const resConfirm = await request(app).get(`/api/usuarios/confirmar-cambio-email/${emailChangeToken}`);
    expect(resConfirm.status).toBe(200);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'confirmado@test.com', password: 'Password123' });

    expect(resLogin.status).toBe(200);
  });

  it('Debería rechazar cambiar la contraseña con la clave actual incorrecta (401)', async () => {
    const res = await request(app)
      .post('/api/usuarios/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordActual: 'ClaveIncorrecta', passwordNueva: 'NuevaClave456' });

    expect(res.status).toBe(401);
  });

  it('Debería cambiar la contraseña exitosamente y permitir login con la nueva clave (200)', async () => {
    const resCambio = await request(app)
      .post('/api/usuarios/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordActual: 'Password123', passwordNueva: 'NuevaClave456' });

    expect(resCambio.status).toBe(200);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'confirmado@test.com', password: 'NuevaClave456' });

    expect(resLogin.status).toBe(200);
  });
});