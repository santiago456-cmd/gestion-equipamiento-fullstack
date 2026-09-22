import { DataTypes } from 'sequelize';
import type { Migration } from '../db/migrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('SOLICITUDES', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    equipoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'EQUIPOS', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'USUARIOS', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    fechaRetiro: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    fechaDevolucion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'cancelada', 'devuelta'),
      allowNull: false,
      defaultValue: 'pendiente',
    },
    autorizadoPor: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'USUARIOS', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('SOLICITUDES');
};