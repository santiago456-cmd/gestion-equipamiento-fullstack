import {describe, it, expect, beforeAll, afterAll} from 'vitest'
import request from 'supertest';
import type { Express } from 'express';
import type { Server } from 'http'
import { createApp } from '../src/app.js'; 
import { sequelize } from '../src/config/dataBase.js'; // <-- CLAVE: database en minúscula


describe('Pruebas del Módulo de Autenticación', () => {
  let app: Express;
  let server: Server;

  beforeAll(async () => {
    app = createApp();
    server = app.listen(0);
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

  // ==========================================
  // MÓDULO DE LOGIN
  // ==========================================

  // --- CAMINO FELIZ ---
  it('Debería iniciar sesión correctamente y retornar un JWT (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alumno@miuniversidad.edu.ar',
        password: 'Password123' 
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token'); 
  });

  // --- CAMINO NO FELIZ (Credenciales erróneas) ---
  it('Debería rechazar el inicio de sesión con contraseña inválida (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alumno@miuniversidad.edu.ar',
        password: 'ContraseñaIncorrecta'
      });
    expect(res.status).toBe(401);
  });
});