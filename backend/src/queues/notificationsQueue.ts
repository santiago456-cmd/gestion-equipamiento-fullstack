import {Queue} from 'bullmq'
import { env } from '../config/env.js'
import { requestContext } from '../middlewares/requestContext.js'

export interface EmailChangeConfirmationJobData {
    type: 'email-change-confirmation';
    to: string;
    nombre: string;
    token: string;
    requestId?: string;
}

export interface WelcomeEmailJobData {
    type: 'welcome-email';
    to: string;
    nombre: string;
    requestId?: string
}

export interface ConfirmationEmailJobData {
    type: 'confirmation-email';
    to: string;
    nombre: string;
    token: string;
    requestId?: string
}

export interface PasswordResetEmailJobData {
    type: 'password-reset-email';
    to: string;
    nombre: string;
    token: string;
    requestId?: string
}

export type NotificationJobData = 
    | WelcomeEmailJobData
    | ConfirmationEmailJobData
    | PasswordResetEmailJobData
    | EmailChangeConfirmationJobData


export const notificationQueue = new Queue<NotificationJobData>('notifications', {
    connection: {
        host: env.redis.host,
        port: env.redis.port,
        retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    }
})

export async function enqueue(data: NotificationJobData): Promise<void> {
    const requestId = requestContext.getStore()?.requestId;

    await notificationQueue.add(
        data.type,
        {...data, requestId},
        {
            attempts: 3,
            backoff: {type: 'exponential', delay: 2000}
        }
    )
}

export async function enqueueWelcomeEmail(data: Omit<WelcomeEmailJobData, 'type' | 'requestId'>): Promise<void> {
    await enqueue({
        type: 'welcome-email',
        ...data
    })
}

export async function enqueueConfirmationEmail(data: Omit<ConfirmationEmailJobData, 'type' | 'requestId'>): Promise<void> {
    await enqueue({ type: 'confirmation-email', ...data })
}

export async function enqueuePasswordResetEmail(
    data: Omit<PasswordResetEmailJobData, 'type' | 'requestId'>
): Promise<void> {
    await enqueue({type: 'password-reset-email', ...data})
}

export async function enqueueEmailChangeConfirmation(
    data: Omit<EmailChangeConfirmationJobData, 'type' | 'requestId'>
): Promise<void>{
    await enqueue({ type: 'email-change-confirmation', ...data})
}