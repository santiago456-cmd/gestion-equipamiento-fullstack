import { reportsQueue } from '../queues/reportsQueue.js';

async function main(): Promise<void> {
  await reportsQueue.add('scheduler-monthly-reports', { type: 'scheduler-monthly-reports' });
  console.log('✅ Job de reportes encolado manualmente.');
  await reportsQueue.close(); // cierra la conexion, así el proceso termina solo
}

main().catch((err) => {
  console.error('❌ Error al encolar el job:', err);
  process.exit(1);
});