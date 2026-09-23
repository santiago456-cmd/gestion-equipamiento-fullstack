import { migrator } from '../db/migrator.js';
import { sequelize } from '../config/dataBase.js';

const command = process.argv[2];

async function main(): Promise<void> {
  switch (command) {
    case 'up':
      await migrator.up();
      console.log('✅ Migraciones aplicadas correctamente.');
      break;
    case 'down':
      await migrator.down();
      console.log('↩️  Última migración revertida.');
      break;
    case 'status': {
      const pending = await migrator.pending();
      const executed = await migrator.executed();
      console.log(`Ejecutadas (${executed.length}):`, executed.map((m) => m.name));
      console.log(`Pendientes (${pending.length}):`, pending.map((m) => m.name));
      break;
    }
    default:
      console.error('Uso: tsx src/scripts/runMigrations.ts <up|down|status>');
      process.exit(1);
  }

  await sequelize.close();
}

main().catch((err) => {
  console.error('❌ Error ejecutando migraciones:', err);
  process.exit(1);
});