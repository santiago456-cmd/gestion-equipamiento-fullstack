import {describe, it, expect, beforeAll, afterAll} from 'vitest'
import request from 'supertest';
import jwt from 'jsonwebtoken';
import type { Express } from 'express';
import type { Server } from 'http'
import { createApp } from '../src/app.js'; 
import { sequelize } from '../src/config/dataBase.js'; // <-- CLAVE: database en minúscula


const JWT_EMAIL_SECRET = process.env.JWT_EMAIL_SECRET || 'secreto_email_para_pruebas_456'

describe('Pruebas del Módulo de Autenticación', () => {
  let app: Express;
  let server: Server;
  let usuarioId: number;
  let tokenAlumno: string;

   beforeAll(async () => {
    app = createApp();
    server = app.listen(0);

    const registro = await request(app).post('/api/auth/register').send({
      email: 'alumno_test@test.com',
      password: 'Password123',
      nombre: 'Alumno Test',
      rol: 'usuario',
    });

    const usuarioId = registro.body.data.id;

    // Simulamos el click en el mail de confirmación
    const confirmationToken = jwt.sign(
      { id: usuarioId, type: 'email-confirmation' },
      JWT_EMAIL_SECRET,
      { expiresIn: '24h' },
    );
    await request(app).get(`/api/auth/confirmar/${confirmationToken}`);

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

  // ==========================================
  // MÓDULO DE REGISTRO
  // ==========================================

  // --- CAMINO FELIZ ---
  it('Debería registrar un nuevo usuario exitosamente (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'alumno@miuniversidad.edu.ar',
        password: 'Password123',
        nombre: 'Juan Perez',
        rol: 'usuario' 
      });

    expect(res.status).toBe(201);
    usuarioId = res.body.data.id;
    expect(usuarioId).toBeDefined()
  });

  // --- CAMINO NO FELIZ (Validación de duplicados) ---
  it('Debería rechazar el registro si el correo electrónico ya existe (400)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'alumno@miuniversidad.edu.ar', 
        password: 'OtraPassword456',
        nombre: 'Otro Alumno',
        rol: 'usuario'
      });

    expect(res.status).toBe(400);
  });

  it('Deberia rechazar el inicio de sesion si la cuenta no fue confirmada (403)', async () =>{
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alumno@miuniversidad.edu.ar', password: 'Password123'})
    
      expect(res.status).toBe(403)
  })

  it('Deberia rechazar la confirmacion con un token invalido (400)', async () =>{
    const res = await request(app).get('/api/auth/confirmar/token-invalido')
    expect(res.status).toBe(400)
  })

  it('Debería confirmar la cuenta con un token válido (200)', async () => {
    const token = jwt.sign(
      { id: usuarioId, type: 'email-confirmation' },
      JWT_EMAIL_SECRET,
      { expiresIn: '24h' },
    );

    const res = await request(app).get(`/api/auth/confirmar/${token}`);
    expect(res.status).toBe(200);
  });

  it('Debería iniciar sesión correctamente después de confirmar la cuenta y retornar un JWT (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alumno@miuniversidad.edu.ar', password: 'Password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

   it('Debería rechazar el inicio de sesión con contrasena inválida (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alumno@miuniversidad.edu.ar', password: 'ContrasenaIncorrecta' });

    expect(res.status).toBe(401);
  });

  it('Debería solicitar la recuperación de contrasena sin filtrar si el email existe (200)', async () => {
    const res = await request(app)
      .post('/api/auth/recuperar-contrasena')
      .send({ email: 'no-existe@test.com' });

    expect(res.status).toBe(200);
  });

  it('Debería restablecer la contrasena con un token válido y permitir el login con la nueva clave (200)', async () => {
    const resetToken = jwt.sign(
      { id: usuarioId, type: 'password-reset' },
      JWT_EMAIL_SECRET,
      { expiresIn: '30m' },
    );

    const resReset = await request(app)
      .post('/api/auth/restablecer-contrasena')
      .send({ token: resetToken, nuevaContrasena: 'NuevaPassword456' });

    expect(resReset.status).toBe(200);

    const resLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alumno@miuniversidad.edu.ar', password: 'NuevaPassword456' });

    expect(resLogin.status).toBe(200);
  });
});
