import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from "sequelize";
import { sequelize } from "../config/dataBase.js";
import type { Solicitud } from "./Solicitud.js";

const ESTADOS = ["disponible", "prestado", "mantenimiento", "baja"] as const

type Estado = typeof ESTADOS[number]

export class Equipo extends Model<
  InferAttributes<Equipo, { omit: "solicitudes" }>,
  InferCreationAttributes<Equipo, { omit: "solicitudes" }>
>
{
  declare id: CreationOptional<number>;
  declare codigoInventario: string;
  declare nombre: string;
  declare categoria: string;
  declare estado: CreationOptional<Estado>;
  declare ubicacion: string;
  declare requiereAutorizacion: CreationOptional<boolean>;
  declare solicitudes?: NonAttribute<Solicitud[]>;
}

Equipo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    codigoInventario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El código de inventario no puede estar vacío." },
      },
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre del equipo no puede estar vacío." },
      },
    },
    categoria: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La categoría no puede estar vacía." },
      },
    },
    estado: {
      type: DataTypes.ENUM(...ESTADOS),
      allowNull: false,
      defaultValue: "disponible",
      validate: {
        isIn: {
          args: [ESTADOS as unknown as string[]],
          msg: "El estado provisto no es un estado válido para el equipo.",
        },
      },
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "La ubicación no puede estar vacía." },
      },
    },
    requiereAutorizacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Equipo",
    tableName: "EQUIPOS",
    timestamps: false,
  },
);
