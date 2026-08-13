import {Solicitud} from '../../models/Solicitud.js';
import { Equipo } from '../../models/Equipo.js';
import { Usuario } from '../../models/Usuario.js'


export const seedSolicitudes = async (): Promise<void> => {
  const cantidad = await Solicitud.count();
  if (cantidad > 0) {
    console.log('⚠️ Ya existen solicitudes. No se insertan datos iniciales.');
    return;
  }

  const carla = await Usuario.findOne({ where: { email: 'carla@dds.com' } });
  const lucas = await Usuario.findOne({ where: { email: 'lucas@dds.com' } });
  const admin = await Usuario.findOne({ where: { email: 'admin@dds.com' } });

  const notebookDell = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-001' } });
  const notebookHP = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-002' } });
  const proyectorEpson = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-003' } });
  const proyectorView = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-004' } });
  const camaraSony = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-005' } });
  const camaraCanon = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-006' } });
  const kitCisco = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-007' } });
  const osciloscopio = await Equipo.findOne({ where: { codigoInventario: 'INV-2026-008' } });


  if (
    !carla || !lucas || !admin ||
    !notebookDell || !notebookHP || !proyectorEpson || !proyectorView ||
    !camaraSony || !camaraCanon || !kitCisco || !osciloscopio
  ){
    console.error('❌ Faltan usuarios o equipos base para sembrar solicitudes. Ejecutá primero los seeders de usuarios y equipos.');
    return;
  }

  const solicitudes = [
    // --- ESTADO: PENDIENTE ---
    { fechaRetiro: '2026-06-15', fechaDevolucion: '2026-06-18', motivo: 'Proyecto Final DDS', estado: 'pendiente', equipoId: notebookDell.id, usuarioId: carla.id, autorizadoPor: null },
    { fechaRetiro: '2026-06-16', fechaDevolucion: '2026-06-17', motivo: 'Clase Práctica Física', estado: 'pendiente', equipoId: proyectorEpson.id, usuarioId: lucas.id, autorizadoPor: null },

    // --- ESTADO: APROBADA ---
    { fechaRetiro: '2026-06-08', fechaDevolucion: '2026-06-12', motivo: 'Laboratorio de Redes', estado: 'aprobada', equipoId: notebookHP.id, usuarioId: carla.id, autorizadoPor: admin.id },
    { fechaRetiro: '2026-06-20', fechaDevolucion: '2026-06-25', motivo: 'Testing de Software', estado: 'aprobada', equipoId: kitCisco.id, usuarioId: lucas.id, autorizadoPor: admin.id },

    // --- ESTADO: PRÉSTAMOS VENCIDOS ---
    { fechaRetiro: '2026-05-10', fechaDevolucion: '2026-05-15', motivo: 'Taller de Fotografía', estado: 'aprobada', equipoId: camaraSony.id, usuarioId: carla.id, autorizadoPor: admin.id },
    { fechaRetiro: '2026-05-20', fechaDevolucion: '2026-05-22', motivo: 'Presentación de Tesis', estado: 'aprobada', equipoId: proyectorView.id, usuarioId: lucas.id, autorizadoPor: admin.id },

    // --- ESTADO: RECHAZADA ---
    { fechaRetiro: '2026-06-01', fechaDevolucion: '2026-06-05', motivo: 'Uso Particular Doméstico', estado: 'rechazada', equipoId: notebookDell.id, usuarioId: lucas.id, autorizadoPor: admin.id },
    { fechaRetiro: '2026-06-02', fechaDevolucion: '2026-06-04', motivo: 'Prueba de circuitos', estado: 'rechazada', equipoId: osciloscopio.id, usuarioId: carla.id, autorizadoPor: admin.id },

    // --- ESTADO: CANCELADA ---
    { fechaRetiro: '2026-06-22', fechaDevolucion: '2026-06-24', motivo: 'Cancelado por cambio de fecha de examen', estado: 'cancelada', equipoId: camaraCanon.id, usuarioId: carla.id, autorizadoPor: null },
    { fechaRetiro: '2026-06-28', fechaDevolucion: '2026-06-30', motivo: 'Evento suspendido', estado: 'cancelada', equipoId: proyectorEpson.id, usuarioId: lucas.id, autorizadoPor: null },

    // --- ESTADO: DEVUELTA ---
    { fechaRetiro: '2026-05-02', fechaDevolucion: '2026-05-05', motivo: 'Práctica Inicial', estado: 'devuelta', equipoId: notebookDell.id, usuarioId: lucas.id, autorizadoPor: admin.id },
    { fechaRetiro: '2026-05-12', fechaDevolucion: '2026-05-15', motivo: 'Estudio para Parcial', estado: 'devuelta', equipoId: notebookHP.id, usuarioId: carla.id, autorizadoPor: admin.id },
  ] as const;

  await Solicitud.bulkCreate([...solicitudes])

  console.log('✅ 12 Solicitudes inicializadas dinámicamente con éxito[cite: 82].');
};