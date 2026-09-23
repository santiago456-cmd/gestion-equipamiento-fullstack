import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { Server } from 'http';

import { createApp } from '../src/app.js';
import { sequelize } from '../src/config/dataBase.js';

const JWT_EMAIL_SECRET =
  process.env.JWT_EMAIL_SECRET || 'secreto_email_para_pruebas_456';

const TEST_USER = {
  email: 'alumno@miuniversidad.edu.ar',
  password: 'Password123',
  nombre: 'Juan Perez',
  rol: 'usuario',
} as const;

describe('Pruebas del Módulo de Autenticación', () => {
  let app: Express;
  let server: Server;
  let usuarioId: number;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(0);
  });

  afterAll(async () => {
    await sequelize.close();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  });

  // ==========================================
  // MÓDULO DE REGISTRO
  // ==========================================

  it('Debería registrar un nuevo usuario exitosamente (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(TEST_USER);

    expect(res.status).toBe(201);

    usuarioId = res.body.data.id;

    expect(usuarioId).toBeDefined();
  });

  it('Debería rechazar el registro si el correo electrónico ya existe (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: TEST_USER.email,
        password: 'OtraPassword456',
        nombre: 'Otro Alumno',
        rol: 'usuario',
      });

    expect(res.status).toBe(400);
  });

  // ==========================================
  // MÓDULO DE CONFIRMACIÓN DE CUENTA
  // ==========================================

  it('Debería rechazar el inicio de sesión si la cuenta no fue confirmada (403)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    expect(res.status).toBe(403);
  });

  it('Debería rechazar la confirmación con un token inválido (400)', async () => {
    const res = await request(app)
      .get('/api/auth/confirmar/token-invalido');

    expect(res.status).toBe(400);
  });

  it('Debería confirmar la cuenta con un token válido (200)', async () => {
    const token = jwt.sign(
      {
        id: usuarioId,
        type: 'email-confirmation',
      },
      JWT_EMAIL_SECRET,
      {
        expiresIn: '24h',
      },
    );

    const res = await request(app)
      .get(`/api/auth/confirmar/${token}`);

    expect(res.status).toBe(200);
  });

  // ==========================================
  // MÓDULO DE LOGIN — cookie httpOnly
  // ==========================================

  it('Debería iniciar sesión correctamente y setear la cookie httpOnly (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    expect(res.status).toBe(200);

    // El access token no debe exponerse en el body.
    expect(res.body).not.toHaveProperty('token');

    expect(res.body.usuario).toBeDefined();

    const cookies = res.headers['set-cookie'];

    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('accessToken=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('Debería rechazar el inicio de sesión con contraseña inválida (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: 'ContraseñaIncorrecta',
      });

    expect(res.status).toBe(401);
  });

  // ==========================================
  // MÓDULO DE SESIÓN — GET /api/auth/me
  // ==========================================

  describe('GET /api/auth/me', () => {
    it('Debería devolver 401 sin cookie de sesión', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
    });

    it('Debería devolver el usuario actual con una sesión válida (200)', async () => {
      const agent = request.agent(app);

      const resLogin = await agent
        .post('/api/auth/login')
        .send({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });

      expect(resLogin.status).toBe(200);

      const res = await agent.get('/api/auth/me');

      expect(res.status).toBe(200);
      expect(res.body.usuario).toBeDefined();

      expect(res.body.usuario).toHaveProperty(
        'email',
        TEST_USER.email,
      );

      // Nunca deben exponerse credenciales o hashes.
      expect(res.body.usuario).not.toHaveProperty('password');
      expect(res.body.usuario).not.toHaveProperty('passwordHash');
    });
  });

  // ==========================================
  // MÓDULO DE LOGOUT — cookie + blacklist Redis
  // ==========================================

  it('Debería permitir logout y blacklistear el token, rechazando su uso posterior (200 → 401)', async () => {
    const agent = request.agent(app);

    const resLogin = await agent
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

    expect(resLogin.status).toBe(200);

    const resLogout = await agent.post('/api/auth/logout');

    expect(resLogout.status).toBe(200);

    // El mismo agente conserva las cookies como lo haría un navegador.
    // Después del logout, la sesión ya no debe permitir acceder
    // a endpoints protegidos.
    const resIntentoPosterior = await agent
      .patch('/api/usuarios/me')
      .send({
        nombre: 'Intento post-logout',
      });

    expect(resIntentoPosterior.status).toBe(401);
  });

  // ==========================================
  // MÓDULO DE RECUPERACIÓN DE CONTRASEÑA
  // ==========================================

  it('Debería solicitar la recuperación de contraseña sin filtrar si el email existe (200)', async () => {
    const res = await request(app)
      .post('/api/auth/recuperar-contrasena')
      .send({
        email: 'no-existe@test.com',
      });

    expect(res.status).toBe(200);
  });

  it('Debería restablecer la contraseña con un token válido y permitir el login con la nueva clave (200)', async () => {
    const nuevaContrasena = 'NuevaPassword456';

    const resetToken = jwt.sign(
      {
        id: usuarioId,
        type: 'password-reset',
      },
      JWT_EMAIL_SECRET,
      {
        expiresIn: '30m',
      },
    );

    const resReset = await request(app)
      .post('/api/auth/restablecer-contrasena')
      .send({
        token: resetToken,
        nuevaContrasena,
      });

    expect(resReset.status).toBe(200);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: TEST_USER.email,
        password: nuevaContrasena,
      });

    expect(resLogin.status).toBe(200);
    expect(resLogin.headers['set-cookie']).toBeDefined();
  });
});