import { Worker, Job } from "bullmq";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { requestContext } from "../middlewares/requestContext.js";
import { sendWelcomeEmail, sendConfirmationEmail, sendPasswordResetEmail } from "../services/EmailService.js";
import type { NotificationJobData } from "../queues/notificationsQueue.js";

const worker = new Worker<NotificationJobData>(
    'notifications',
    async (job: Job<NotificationJobData>) => {
        const requestId = job.data.requestId ?? `job-${job.id}`;

        await requestContext.run({ requestId}, async () => {
            logger.info({jobType: job.data.type, jobId: job.id}, 'Procesando notificacion');

            switch (job.data.type) {
                case 'welcome-email':
                    await sendWelcomeEmail(job.data.to, job.data.nombre)
                    break
                case 'confirmation-email':
                    await sendConfirmationEmail(job.data.to, job.data.nombre, job.data.token)
                    break
                case 'password-reset-email':
                    await sendPasswordResetEmail(job.data.to, job.data.nombre, job.data.token)
                    break
                default:
                    logger.warn({jobName: job.name}, 'Tipo de notificacion desconocido')
            }
        })
    },
    {
        connection: {
            host: env.redis.host,
            port: env.redis.port,
        }
    }
)

worker.on('completed', (job) => {
    logger.info({jobId: job.id}, 'Notificacion procesada exitosamente')
})

worker.on('failed', (job, err) => {
    logger.error({jobId: job?.id, err}, 'Fallo el procesamiento de la notificacion')
})

logger.info('Worker de notificaciones iniciado, esperando trabajos...')