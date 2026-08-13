
import { sequelize } from "../config/dataBase.js";
import { setupAssociations } from "../models/associations.js";

import { seedUsuarios } from "./seeders/usuarioSeeder.js";
import { seedEquipos } from "./seeders/equipoSeeder.js";
import { seedSolicitudes } from "./seeders/solicitudSeeder.js";

// Configurar las asociaciones de Sequelize
setupAssociations();


const force = process.argv.includes('--force');

async function main(): Promise<void> {
  try {
    console.log('🔌 Verificando conexión con la base de datos...');
    
    await sequelize.authenticate();
    console.log('✔ Conexión establecida exitosamente.');
    
    console.log(`🧱 Sincronizando tablas en la base de datos. force=${force}`);
    await sequelize.sync({ force });
    
    console.log('🌱 Iniciando la siembra de datos semilla...');
    
    await seedUsuarios();    
    await seedEquipos();     
    await seedSolicitudes(); 

    console.log('🟢 Base de datos e integridad relacional inicializadas correctamente.');
  } catch (error) {
    console.error('❌ Error crítico al inicializar la base de datos:', error);
  } finally {
    console.log('🔌 Cerrando conexiones de base de datos...');
    await sequelize.close();
    process.exit(0);
  }
}

main();