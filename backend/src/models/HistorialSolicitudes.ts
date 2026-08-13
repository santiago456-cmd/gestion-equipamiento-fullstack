import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../config/dataBase.js';

export class HistorialSolicitud extends Model<
  InferAttributes<HistorialSolicitud>,
  InferCreationAttributes<HistorialSolicitud>
>
{
  declare id: CreationOptional<number>;
  declare solicitudId: number;
  declare usuarioId: number;
  declare accion: string;
  declare fechaHora: CreationOptional<Date>;
  declare valorAnterior: string | null;
  declare valorNuevo: string;
}

HistorialSolicitud.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  solicitudId: {
    type: DataTypes.INTEGER,
    allowNull: false 
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false 
  },
  accion: {
    type: DataTypes.STRING(100), 
    allowNull: false
  },
  fechaHora: {
    
    type: DataTypes.DATE, 
    allowNull: false,
    defaultValue: DataTypes.NOW 
  },
  valorAnterior: {
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  valorNuevo: {
    type: DataTypes.TEXT, 
    allowNull: false
  }
},
{
  sequelize,
  modelName: 'HistorialSolicitud',
  tableName: 'HISTORIALSOLICITUD', 
  timestamps: false 
});