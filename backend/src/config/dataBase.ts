
import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  logging: false,
});

// Cargamos modelos y asociaciones después de inicializar `sequelize`.
// De este modo `models/*.js` pueden importar `sequelize` sin generar una
// dependencia circular que provoque errores durante la inicialización.
// import "../models/Usuario.js";
// import "../models/Equipo.js";
// import "../models/Solicitud.js";
// import "../models/HistorialSolicitudes.js";
// import "../models/associations.js";
