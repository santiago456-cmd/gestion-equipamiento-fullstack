import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/dataBase.js';
import type { Equipo } from './Equipo.js';
import type { Usuario } from './Usuario.js';
import type { HistorialSolicitud } from './HistorialSolicitudes.js';

const ESTADOS = ["pendiente", "aprobada", "rechazada", "cancelada", "devuelta"] as const

export type Estado = typeof ESTADOS[number]

export class Solicitud extends Model<
  InferAttributes<Solicitud, { omit: "equipo" | "solicitante" | "autorizador" | "historial" }>,
  InferCreationAttributes<Solicitud, { omit: "equipo" | "solicitante" | "autorizador" | "historial" }>
>
{
  declare id: CreationOptional<number>;
  declare equipoId: number;
  declare usuarioId: number
  declare fechaRetiro: string;
  declare fechaDevolucion: string;
  declare motivo: string;
  declare estado: CreationOptional<Estado>;
  declare autorizadoPor: number | null
  // Propiedades de datos para las relaciones (solo tipan el resultado de los `include`,
  // no generan métodos get*/set*/add* — esos no se usan en esta arquitectura)
  declare equipo?: NonAttribute<Equipo>;
  declare solicitante?: NonAttribute<Usuario>;
  declare autorizador?: NonAttribute<Usuario | null>;
  declare historial?: NonAttribute<HistorialSolicitud[]>;
}

Solicitud.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true, 
    autoIncrement: true
  },
  equipoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull:false
  },

  fechaRetiro: {
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  fechaDevolucion: {
    type: DataTypes.DATEONLY,
    allowNull: false 
  },
  motivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM(...ESTADOS),
    allowNull: false,
    defaultValue: 'pendiente', 
    validate: {
      isIn: {
        args: [ESTADOS as unknown as string[]],
        msg: "El estado provisto no es un estado válido para la solicitud."
      }
    }
  },
  autorizadoPor: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
},
{
  sequelize,
  modelName: 'Solicitud',
  tableName: 'SOLICITUDES', 
  timestamps: false 
});