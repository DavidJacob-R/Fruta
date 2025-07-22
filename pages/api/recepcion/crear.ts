import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, empresa, agricultores, empaques,tipos_fruta, notas } from '@/lib/schema' // ← Asegúrate que empaques esté importado
import { eq, desc } from 'drizzle-orm'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { PDFDocument } from 'pdf-lib'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { 
    agricultor_id, empresa_id, tipo_fruta_id, cantidad_cajas, fecha_recepcion, usuario_recepcion_id, notas: notasRecepcion,
    tipo_nota, empaque_id
  } = req.body

  try {
    // ... (validaciones iguales)

    // 1. Validación igual a tu código actual...

    const cajas = Number(cantidad_cajas) > 0 ? Number(cantidad_cajas) : 1
    const peso = Number(empaque_id) > 0 ? Number(empaque_id) : null
    if (!tipo_fruta_id || !peso || !fecha_recepcion || !usuario_recepcion_id || !tipo_nota) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos.' })
    }

    const ultimaNota = await db
      .select({ numero_nota: recepcion_fruta.numero_nota })
      .from(recepcion_fruta)
      .orderBy(desc(recepcion_fruta.numero_nota))
      .limit(1)

    const siguienteNumero = ultimaNota.length && ultimaNota[0].numero_nota
      ? ultimaNota[0].numero_nota + 1
      : 1

    const insertData: any = {
      tipo_fruta_id: Number(tipo_fruta_id),
      cantidad_cajas: cajas,
      peso_caja_oz: peso,
      fecha_recepcion: new Date(fecha_recepcion),
      usuario_recepcion_id: Number(usuario_recepcion_id),
      notas: typeof notasRecepcion === 'string' ? notasRecepcion.trim() : (notasRecepcion ? JSON.stringify(notasRecepcion) : ''),
      tipo_nota: String(tipo_nota),
      numero_nota: siguienteNumero,
      empaque_id: empaque_id ? Number(empaque_id) : null,
      agricultor_id: null,
      empresa_id: null,
    }

    if (tipo_nota === 'empresa') {
      insertData.empresa_id = Number(empresa_id)
      insertData.agricultor_id = null
    } else {
      insertData.agricultor_id = Number(agricultor_id)
      insertData.empresa_id = null
    }

    // Insertar la recepción y obtener el id generado
    const [recepcionCreada] = await db.insert(recepcion_fruta).values(insertData).returning({ id: recepcion_fruta.id })
    const recepcionId = recepcionCreada.id

    // Crear notas (igual que tu código)

    await db.insert(notas).values({
      titulo: 'Nota de recepción',
      contenido: '',
      modulo: 'recepcion',
      relacion_id: recepcionId,
      usuario_creacion_id: Number(usuario_recepcion_id),
    })

    await db.insert(notas).values({
      titulo: 'Nota de calidad',
      contenido: '',
      modulo: 'calidad',
      relacion_id: recepcionId,
      usuario_creacion_id: Number(usuario_recepcion_id),
    })

    // === CREAR PDF Y SUBIRLO A SUPABASE ===

    // Consultar datos reales para imprimirlos en el PDF:
    let agricultorNombre = '', nombreFruta = '', nombreEmpaque = '', nombreUsuario = ''

    // Agricultor
    if (insertData.agricultor_id) {
      const [agricultorRow] = await db.select().from(agricultores).where(eq(agricultores.id, Number(insertData.agricultor_id)))
      agricultorNombre = agricultorRow ? `${agricultorRow.nombre} ${agricultorRow.apellido}` : ''
    }

    // Fruta
    if (insertData.tipo_fruta_id) {
      const [frutaRow] = await db.select().from(tipos_fruta).where(eq(tipo_fruta_id, Number(insertData.tipo_fruta_id)))
      nombreFruta = frutaRow ? (frutaRow.nombre ?? '') : ''
    }

    // Empaque
    if (insertData.empaque_id) {
      const [empaqueRow] = await db.select().from(empaques).where(eq(empaques.id, Number(insertData.empaque_id)))
      nombreEmpaque = empaqueRow ? (empaqueRow.tamanio ?? '') : ''
    }

    // Usuario que recibe
    // Si tienes tabla de usuarios, consúltala aquí para poner el nombre, si no, usa el ID:
    nombreUsuario = String(usuario_recepcion_id)

    // Notas divididas
    const notasArr = (insertData.notas || '').split('\n')

    // 2. Cargar plantilla PDF
    const pdfPath = path.resolve(process.cwd(), 'pages/api/pdf/NotaRecepcionMaquila.pdf')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const page = pdfDoc.getPages()[0]

    // 3. Sobrescribir los datos en el PDF (usa las nuevas coordenadas)
page.drawText(`${siguienteNumero}`, { x: 145, y: 735, size: 12 })
page.drawText(`${new Date(fecha_recepcion).toLocaleDateString()}`, { x: 395, y: 735, size: 12 })
page.drawText(agricultorNombre, { x: 130, y: 704, size: 12 })
page.drawText(nombreFruta, { x: 140, y: 680, size: 12 })           // ← Ajustado
page.drawText(String(cajas), { x: 180, y: 651, size: 12 })         // ← Ajustado
page.drawText(nombreEmpaque, { x: 255, y: 620, size: 12 })

page.drawText(notasArr[0] || '', { x: 85, y: 555, size: 12 }) // ← Más abajo
page.drawText(notasArr[1] || '', { x: 85, y: 540, size: 12 })
page.drawText(notasArr[2] || '', { x: 85, y: 525, size: 12 })

page.drawText(nombreUsuario, { x: 240, y: 500, size: 12 })     // ← Más abajo
page.drawText('', { x: 180, y: 475, size: 12 })                     // ← Ajustado (más abajo)


    const pdfBytes = await pdfDoc.save()

    // Definir el nombre del archivo PDF
    const nombreArchivo = `nota-recepcion-${siguienteNumero}.pdf`

    // Subir a Supabase Storage
    const { error } = await supabase
      .storage
      .from('elmolinito')
      .upload(nombreArchivo, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) {
      console.error('Error subiendo PDF:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Error al subir PDF', 
        detalles: error, 
        errorMessage: error.message,
      })
    }

    res.status(200).json({ success: true, numero_nota: siguienteNumero, archivo_pdf: nombreArchivo })
  } catch (error: any) {
    console.error(error)
    const errorCode = error.code || error.cause?.code
    if (errorCode === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un registro con esos datos.' })
    }
    res.status(500).json({ success: false, message: 'Error al registrar la recepción' })
  }
}
