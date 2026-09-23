import PDFDocument from 'pdfkit'
import { SolicitudRepository } from '../repositories/SolicitudRepository.js'
import { EquipoRepository } from '../repositories/EquipoRepository.js'
import { UsuarioRepository } from '../repositories/UsuarioRepository.js'
import type { Usuario } from '../models/Usuario.js'

const solicitudRepo = new SolicitudRepository()
const equipoRepo = new EquipoRepository()
const usuarioRepo = new UsuarioRepository()

function streamToBuffer(doc: PDFKit.PDFDocument): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        doc.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
        });

        doc.on("end", () => {
            resolve(Buffer.concat(chunks));
        });

        doc.on("error", reject);

        doc.end();
    });
}

function drawHeader(doc: PDFKit.PDFDocument, titulo: string, substitulo: string): void{
    doc.fontSize(18).text(titulo, {align: 'center'})
    doc.fontSize(10).fillColor('#666666').text(substitulo, {align: 'center'})
    doc.moveDown(1.5)
    doc.fillColor('#000000')
}

function drawTableRow(doc: PDFKit.PDFDocument, y: number, cols: string[], widths: number[], bold = false): void{
    let x = doc.page.margins.left
    doc.font(bold ? 'Helvetica-Bold': 'Helvetica').fontSize(9)
    cols.forEach((text, i) => {
        doc.text(text, x, y, {width: widths[i], ellipsis: true})
        x += widths[i]
    })
}

export async function generarReporteHistorialUsuario(usuarioId: number, desde: string, hasta: string): Promise<Buffer>{
    const usuario = await usuarioRepo.findById(usuarioId)
    const solicitudes = await solicitudRepo.findByUsuarioIdEnRango(usuarioId, desde, hasta)

    const doc = new PDFDocument({margin: 40, size: 'A4'})
    drawHeader(doc, 'Historial de solicitudes', `${usuario?.nombre ?? 'Usuario'} - periodo ${desde} a ${hasta}`)

    const widths = [70, 70, 150, 90, 130]
    const headers = ['Retiro', 'Devolucion', 'Equipo', 'Estado', 'Motivo']

    let y = doc.y
    drawTableRow(doc, y, headers, widths, true)
    y += 18
    doc.moveTo(40, y -4).lineTo(555, y -4).strokeColor('#ccccc').stroke()

    if (solicitudes.length === 0){
        doc.font('Helvetica').fontSize(10).text('No se registraron solicitudes en este periodo.', 40, y + 10)
    }

    for (const s of solicitudes ){
        if (y > 760){
            doc.addPage()
            y = 40
        }
        drawTableRow(doc, y, [
            s.fechaRetiro,
            s.fechaDevolucion,
            s.equipo?.nombre?? '-',
            s.estado, 
            s.motivo,
        ],widths)
        y += 18
    }
    return streamToBuffer(doc)
}

export async function generarReporteResumenAdmin(): Promise<Buffer> {
    const pendientes = await solicitudRepo.countPendientes()
    const aprobadas = await solicitudRepo.countAprobadas()
    const vencidas = await solicitudRepo.findVencidas()
    const equiposDisponibles = await equipoRepo.countDisponibles()
    const equiposPorCategoria = await equipoRepo.countPorCategoria()

    const doc = new PDFDocument({margin: 40, size: 'A4'})
    const fecha = new Date().toLocaleDateString('es-AR', {year: 'numeric', month: 'long' })
    drawHeader(doc, 'Resumen General del sistema', `Corte al ${fecha}`)

    doc.font('Helvetica-Bold').fontSize(12).text('Solicitudes')
    doc.font('Helvetica').fontSize(10)
        .text(`Pendientes: ${pendientes}`)
        .text(`Aprobadas: ${aprobadas}`)
        .text(`Vencidas: ${vencidas.length}`);
    doc.moveDown();

    doc.font('Helvetica-Bold').fontSize(12).text('Equipos');
    doc.font('Helvetica').fontSize(10).text(`Disponibles: ${equiposDisponibles}`);
    doc.moveDown(0.5);
    for (const fila of equiposPorCategoria) {
        doc.text(`  ${fila.categoria}: ${fila.total}`);
    }

    if (vencidas.length > 0) {
        doc.moveDown();
        doc.font('Helvetica-Bold').fontSize(12).text('Solicitudes vencidas');
        doc.font('Helvetica').fontSize(9);
        for (const v of vencidas) {
            doc.text(`  #${v.id} — ${v.equipo?.nombre ?? '-'} — devolución esperada ${v.fechaDevolucion}`);
        }
    }
    return streamToBuffer(doc)
}