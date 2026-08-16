import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
    }
})

export async function sendWelcomeEmail(to: string, nombre: string): Promise<void>{
    await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject: 'Bienvenido a la plataforma de gestion de equipamiento',
        html: `<p>Hola ${nombre},</p><p>Tu cuenta fue creada exitosamente. Ya podés iniciar sesión y comenzar a solicitar equipamiento.</p>`,
    })
}

export async function sendConfirmationEmail(to: string, nombre: string, token: string): Promise<void>{
    const link = `${env.corsOrigin}/confirmar-cuenta?token=${token}`
    await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject: 'Confirma tu cuenta',
        html: `<p>Hola ${nombre},</p><p>Confirma tu cuenta haciendo click en el siguiente enlace (valido por 24 horas):</p><p><a href="${link}">${link}</a></p>`,
    })
}

export async function sendPasswordResetEmail(to: string, nombre: string, token: string): Promise<void>{
    const link = `${env.corsOrigin}/restablecer-contrasena?token=${token}`
    await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject: 'Recuperacion de contrasena',
        html: `<p>Hola ${nombre},</p><p>Solicitaste restablecer tu contraseña. Este enlace es valido solo por 30 minutos:</p><p><a href="${link}">${link}</a></p><p>Si no fuiste vos quien lo solicito, podes ignorar este mensaje.</p>`,
    })
}

export async function sendEmailChangeConfirmation(to: string, nombre: string, token: string): Promise<void>{
    const link = `${env.corsOrigin}/confirmar-cambio-email?token=${token}`
    await transporter.sendMail({
        from: env.smtp.from,
        to,
        subject: 'Confirma tu nuevo correo electronico',
        html: `<p>Hola ${nombre},</p><p>Solicitaste cambiar el correo electronico de tu cuenta a esta direccion. Confirma el cambio haciendo click en el siguiente enlace (valido por 2 horas):</p><p><a href="${link}">${link}</a></p><p>Si no fuiste vos quien lo solicito, podes ignorar este mensaje y tu correo actual seguira sin cambios.</p>`,
    })
}