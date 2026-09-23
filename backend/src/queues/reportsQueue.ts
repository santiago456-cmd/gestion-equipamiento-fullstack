import { Queue } from "bullmq";
import { env } from "../config/env.js";

export interface SchedulerJobData{
    type: 'scheduler-monthly-reports'
}

export interface UserHistoryReportJobData{
    type: 'user-history-report'
    usuarioId: number
    desde: string
    hasta: string
}

export interface DashboardSummaryReportJobData {
    type: 'dashboard-summary-report'
    adminEmail: string
    adminNombre: string
}

export type ReportJobData = SchedulerJobData | UserHistoryReportJobData | DashboardSummaryReportJobData

export const reportsQueue = new Queue<ReportJobData>('reports', {
    connection: {
        host: env.redis.host,
        port: env.redis.port,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000))
    }
})

export async function scheduleMonthlyReports(): Promise<void> {
    await reportsQueue.upsertJobScheduler(
        'monthly-reports-scheduler', // fija el id para que bullmq nunca duplique este repeatable
        { 
            pattern: '0 6 1 * *', // el primero de cada mes a las 6 AM 
            tz: "America/Argentina/Buenos_Aires",
        },
        {
            name: 'scheduler-monthly-reports',
            data: {
                type: 'scheduler-monthly-reports',
            },
        }
    )
}