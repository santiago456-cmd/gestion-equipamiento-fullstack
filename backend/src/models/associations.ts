import { Usuario } from "./Usuario.js";
import { Equipo } from "./Equipo.js";
import { Solicitud } from "./Solicitud.js";
import { HistorialSolicitud } from "./HistorialSolicitudes.js";

export function setupAssociations() {
  
  Equipo.hasMany(Solicitud, { foreignKey: "equipoId", as: "solicitudes" });
  Solicitud.belongsTo(Equipo, { foreignKey: "equipoId", as: "equipo" });

  Usuario.hasMany(Solicitud, {
    foreignKey: "usuarioId",
    as: "solicitudesCreadas",
  });
  Solicitud.belongsTo(Usuario, { foreignKey: "usuarioId", as: "solicitante" });

  Usuario.hasMany(Solicitud, {
    foreignKey: "autorizadoPor",
    as: "solicitudesAutorizadas",
  });
  Solicitud.belongsTo(Usuario, {
    foreignKey: "autorizadoPor",
    as: "autorizador",
  });

  Solicitud.hasMany(HistorialSolicitud, {
    foreignKey: "solicitudId",
    as: "historial",
  });
  HistorialSolicitud.belongsTo(Solicitud, {
    foreignKey: "solicitudId",
    as: "solicitud",
  });

  Usuario.hasMany(HistorialSolicitud, {
    foreignKey: "usuarioId",
    as: "accionesHistorial",
  });
  HistorialSolicitud.belongsTo(Usuario, {
    foreignKey: "usuarioId",
    as: "operador",
  });
}
