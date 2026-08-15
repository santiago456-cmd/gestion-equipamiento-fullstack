import { DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/dataBase.js";

const ROLUSUARIOS = ["usuario", "encargado", "admin"] as const

export type RolUsuario = typeof ROLUSUARIOS[number]

export class Usuario extends Model< 
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
>{
  declare id: CreationOptional<number>;
  declare nombre: string;
  declare email: string;
  declare passwordHash: string;
  declare rol: CreationOptional<RolUsuario>;
  declare activo: CreationOptional<boolean>;
  declare emailVerificado: CreationOptional<boolean>;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: { msg: "El nombre no puede estar vacío." },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Debe ingresar un formato de correo electrónico válido.",
        },
        notEmpty: { msg: "El correo electrónico no puede estar vacío." },
      },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM(...ROLUSUARIOS),
      allowNull: false,
      defaultValue: "usuario",
      validate: {
        isIn: {
          args: [ROLUSUARIOS as unknown as string[]],
          msg: "El rol provisto no es un rol válido para el usuario.",
        },
      },
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
      emailVerificado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }
  },
  {
    sequelize,
    modelName: "Usuario",
    tableName: "USUARIOS",
    timestamps: false,
  },
);
