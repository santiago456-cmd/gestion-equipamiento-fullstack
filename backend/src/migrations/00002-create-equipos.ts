import { DataTypes } from 'sequelize';
import type { Migration } from '../db/migrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('EQUIPOS', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigoInventario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('disponible', 'prestado', 'mantenimiento', 'baja'),
      allowNull: false,
      defaultValue: 'disponible',
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    requiereAutorizacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('EQUIPOS');
};