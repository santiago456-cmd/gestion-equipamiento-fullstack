import { DataTypes } from 'sequelize';
import type { Migration } from '../db/migrator.js';

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable('HISTORIALSOLICITUD', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    solicitudId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'SOLICITUDES', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'USUARIOS', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    accion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fechaHora: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    valorAnterior: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    valorNuevo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
};

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable('HISTORIALSOLICITUD');
};