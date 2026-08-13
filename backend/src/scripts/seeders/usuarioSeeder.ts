import bcrypt from 'bcryptjs';
import { Usuario } from '../../models/Usuario.js';

export const seedUsuarios = async (): Promise<void> => {

  const cantidad = await Usuario.count();
  if (cantidad > 0) {
    console.log('⚠️ Ya existen usuarios registrados. Se omite la carga inicial.');
    return;
  }

  // aca es donde aplicamos bcrypt para las contras
  const salt = await bcrypt.genSalt(10);
  const passwordComun = await bcrypt.hash('usuario123', salt);
  const passwordAdmin = await bcrypt.hash('admin123', salt);

  const usuarios = [
    { id: 1, nombre: 'Carla Ruiz', email: 'carla@dds.com', passwordHash: passwordComun, rol: 'usuario', activo: true },
    { id: 2, nombre: 'Lucas Gómez', email: 'lucas@dds.com', passwordHash: passwordComun, rol: 'usuario', activo: true },
    { id: 3, nombre: 'Admin General', email: 'admin@dds.com', passwordHash: passwordAdmin, rol: 'admin', activo: true }
  ] as const;

  await Usuario.bulkCreate(usuarios, { validate: true });
  console.log('🌱 Usuarios del sistema insertados con éxito.');
};