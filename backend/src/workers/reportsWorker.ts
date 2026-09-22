import { Worker, Job } from "bullmq";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { requestContext } from "../middlewares/requestContext.js";
import { UsuarioRepository } from '../repositories/UsuarioRepository.js';
import { generarReporteHistorialUsuario, generarReporteResumenAdmin } from '../services/ReportService.js';
import { sendReportEmail } from '../services/EmailService.js';
import { reportsQueue, type ReportJobData } from '../queues/reportsQueue.js';
import { setupAssociations } from "../models/associations.js";
import { Equipo } from "../models/Equipo.js";
import { Solicitud } from "../models/Solicitud.js";

setupAssociations()

console.log(
  "Solicitud associations:",
  Object.keys(Solicitud.associations)
);

console.log(
  "Equipo associations:",
  Object.keys(Equipo.associations)
);


const usuarioRepo = new UsuarioRepository();

function rangoMesAnterior(): { desde: string; hasta: string } {
  const hoy = new Date();
  const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMesAnterior = new Date(primerDiaMesActual.getTime() - 1);
  const primerDiaMesAnterior = new Date(ultimoDiaMesAnterior.getFullYear(), ultimoDiaMesAnterior.getMonth(), 1);

  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { desde: fmt(primerDiaMesAnterior), hasta: fmt(ultimoDiaMesAnterior) };
}

const worker = new Worker<ReportJobData>(
  'reports',
  async (job: Job<ReportJobData>) => {
    await requestContext.run({ requestId: `job-${job.id}` }, async () => {
      logger.info({ jobType: job.data.type, jobId: job.id }, 'Procesando job de reportes');

      switch (job.data.type) {
        case 'scheduler-monthly-reports': {
          const { desde, hasta } = rangoMesAnterior();

          const usuarios = await usuarioRepo.findAll({ where: { activo: true, emailVerificado: true } });
          for (const u of usuarios) {
            await reportsQueue.add('user-history-report', {
              type: 'user-history-report',
              usuarioId: u.id,
              desde,
              hasta,
            });
          }

          const admins = await usuarioRepo.findAll({ where: { rol: 'admin', activo: true } });
          for (const a of admins) {
            await reportsQueue.add('dashboard-summary-report', {
              type: 'dashboard-summary-report',
              adminEmail: a.email,
              adminNombre: a.nombre,
            });
          }

          logger.info({ usuarios: usuarios.length, admins: admins.length }, 'Reportes mensuales encolados');
          break;
        }

        case 'user-history-report': {
          const usuario = await usuarioRepo.findById(job.data.usuarioId);
          if (!usuario) return;

          const pdf = await generarReporteHistorialUsuario(job.data.usuarioId, job.data.desde, job.data.hasta);
          await sendReportEmail(
            usuario.email,
            usuario.nombre,
            'Tu historial mensual de solicitudes',
            '<p>Adjuntamos tu historial de solicitudes del último mes.</p>',
            pdf,
            `historial-${job.data.desde}.pdf`,
          );
          break;
        }

        case 'dashboard-summary-report': {
          const pdf = await generarReporteResumenAdmin();
          await sendReportEmail(
            job.data.adminEmail,
            job.data.adminNombre,
            'Resumen mensual del sistema',
            '<p>Adjuntamos el resumen general del sistema correspondiente a este mes.</p>',
            pdf,
            `resumen-admin-${new Date().toISOString().split('T')[0]}.pdf`,
          );
          break;
        }
      }
    });
  },
  { connection: { host: env.redis.host, port: env.redis.port } },
);

worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Job de reportes completado'));
worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'Falló el job de reportes'));

logger.info('Worker de reportes iniciado, esperando trabajos...');