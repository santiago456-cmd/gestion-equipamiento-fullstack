import { Equipo } from '../../models/Equipo.js';


export const seedEquipos = async (): Promise<void> => {
  
  const cantidad = await Equipo.count();
  if (cantidad > 0) {
    console.log('⚠️ Ya existen equipos en el inventario. Se omite la carga inicial.');
    return;
  }

  const equipos = [
    { id: 1, codigoInventario: 'INV-2026-001', nombre: 'Notebook Dell Vostro 14', categoria: 'notebook', estado: 'disponible', ubicacion: 'Laboratorio A5', requiereAutorizacion: false },
    { id: 2, codigoInventario: 'INV-2026-002', nombre: 'Notebook HP ProBook', categoria: 'notebook', estado: 'prestado', ubicacion: 'Laboratorio B2', requiereAutorizacion: false },
    { id: 3, codigoInventario: 'INV-2026-003', nombre: 'Proyector Epson PowerLite', categoria: 'proyector', estado: 'disponible', ubicacion: 'Auditorio Central', requiereAutorizacion: true },
    { id: 4, codigoInventario: 'INV-2026-004', nombre: 'Proyector ViewSonic 4K', categoria: 'proyector', estado: 'disponible', ubicacion: 'Sala de Reuniones', requiereAutorizacion: true },
    { id: 5, codigoInventario: 'INV-2026-005', nombre: 'Cámara Sony Alpha 7 III', categoria: 'cámara', estado: 'prestado', ubicacion: 'Pañol Ingeniería', requiereAutorizacion: true },
    { id: 6, codigoInventario: 'INV-2026-006', nombre: 'Cámara Canon EOS R6', categoria: 'cámara', estado: 'disponible', ubicacion: 'Pañol Ingeniería', requiereAutorizacion: true },
    { id: 7, codigoInventario: 'INV-2026-007', nombre: 'Kit de Red Cisco Básico', categoria: 'kit de red', estado: 'disponible', ubicacion: 'Laboratorio de Redes', requiereAutorizacion: false },
    { id: 8, codigoInventario: 'INV-2026-008', nombre: 'Osciloscopio Digital Rigol', categoria: 'osciloscopio', estado: 'mantenimiento', ubicacion: 'Laboratorio Electrónica', requiereAutorizacion: false }
  ] as const;

  await Equipo.bulkCreate(equipos, { validate: true });
  console.log('🌱 Equipos de pañol insertados con éxito.');
};