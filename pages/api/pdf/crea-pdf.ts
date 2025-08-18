import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { recepcion_fruta, tipos_fruta, empaques, agricultores, empresa } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { numero_nota, fecha } = req.body
    const numeroNotaNum = Number(numero_nota)
    if (!Number.isFinite(numeroNotaNum)) {
      return res.status(400).json({ error: 'numero_nota inválido' })
    }

    // 1) Buscar TODOS los registros con ese numero_nota
    const registros = await db
      .select({
        fruta: tipos_fruta.nombre,
        cantidad: recepcion_fruta.cantidad_cajas,
        empaque: empaques.tamanio,
        variedad: recepcion_fruta.variedad,
        tipo_produccion: recepcion_fruta.tipo_produccion,
        sector: recepcion_fruta.sector,
        marca: recepcion_fruta.marca,
        destino: recepcion_fruta.destino,
        notas: recepcion_fruta.notas,
        agricultor_id: recepcion_fruta.agricultor_id,
        empresa_id: recepcion_fruta.empresa_id
      })
      .from(recepcion_fruta)
      .leftJoin(tipos_fruta, eq(recepcion_fruta.tipo_fruta_id, tipos_fruta.id))
      .leftJoin(empaques, eq(recepcion_fruta.empaque_id, empaques.id))
      .where(eq(recepcion_fruta.numero_nota as any, numeroNotaNum))

    if (!registros.length) {
      return res.status(404).json({ error: 'No existen pedidos con ese número de nota.' })
    }

    // 2) Obtener nombre empresa / agricultor (si existen)
    let nombreEmpresa = ''
    let nombreAgricultor = ''

    if (registros[0].empresa_id) {
      try {
        const [row] = await db
          .select({ id: empresa.id, empresa: empresa.empresa })
          .from(empresa)
          .where(eq(empresa.id, registros[0].empresa_id))
        if (row) nombreEmpresa = row.empresa || ''
      } catch {
        nombreEmpresa = ''
      }
    }

    if (registros[0].agricultor_id) {
      try {
        // Verifica si la tabla existe para no romper si no está creada
        const exists = await db.execute(sql`SELECT to_regclass('public.agricultores') AS reg`)
        const hayTabla = (exists as any)?.rows?.[0]?.reg != null
        if (hayTabla) {
          const [row] = await db
            .select({
              id: agricultores.id,
              nombre: agricultores.nombre,
              apellido: agricultores.apellido
            })
            .from(agricultores)
            .where(eq(agricultores.id, registros[0].agricultor_id))
          if (row) nombreAgricultor = `${row.nombre ?? ''} ${row.apellido ?? ''}`.trim()
        }
      } catch {
        nombreAgricultor = ''
      }
    }

    // 3) Concatenar datos
    const frutasTexto = registros.map(r =>
      `${r.fruta} (${r.cantidad} cajas, ${r.empaque}${r.variedad ? ', ' + r.variedad : ''}${r.tipo_produccion ? ', ' + r.tipo_produccion : ''})`
    ).join(' | ')

    const sectorTexto = [...new Set(registros.map(r => r.sector).filter(Boolean))].join(', ')
    const marcaTexto = [...new Set(registros.map(r => r.marca).filter(Boolean))].join(', ')
    const destinoTexto = [...new Set(registros.map(r => r.destino).filter(Boolean))].join(', ')
    const notasTexto = registros.map(r => r.notas).filter(Boolean).join(' | ')

    // 4) Cargar plantilla PDF
    const pdfPath = path.resolve(process.cwd(), 'pages/api/pdf/Nota.pdf')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const page = pdfDoc.getPages()[0]

    // 5) Escribir datos en PDF
    page.drawText(String(numero_nota), { x: 65, y: 770, size: 12 })
    page.drawText(fecha || '', { x: 185, y: 770, size: 12 })
    page.drawText(nombreEmpresa || nombreAgricultor, { x: 43, y: 755, size: 12 })
    page.drawText(frutasTexto, { x: 43, y: 740, size: 12 })
    if (sectorTexto) page.drawText('Sector: ' + sectorTexto, { x: 43, y: 725, size: 12 })
    if (marcaTexto) page.drawText('Marca: ' + marcaTexto, { x: 43, y: 710, size: 12 })
    if (destinoTexto) page.drawText('Destino: ' + destinoTexto, { x: 43, y: 695, size: 12 })
    if (notasTexto) page.drawText('Notas: ' + notasTexto, { x: 43, y: 680, size: 12 })

    // 6) Guardar y subir a Supabase
    const pdfBytes = await pdfDoc.save()
    const nombreArchivo = `recepciones/nota_${numero_nota}_${Date.now()}.pdf`
    const { error } = await supabase
      .storage
      .from('elmolinito')
      .upload(nombreArchivo, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (error) {
      return res.status(500).json({ error: 'No se pudo subir el PDF a Supabase', detalles: error })
    }

    const { data: publicData } = supabase
      .storage
      .from('elmolinito')
      .getPublicUrl(nombreArchivo)
    const publicUrl = publicData.publicUrl

    return res.status(200).json({
      success: true,
      archivo: nombreArchivo,
      url: publicUrl
    })
  } catch (err: any) {
    console.error('API /api/pdf/crear error:', err)
    // No rompas el flujo de la app si el PDF falla; regresa 200 con advertencia
    return res.status(200).json({
      success: true,
      warning: 'No se pudo generar/subir el PDF, pero la nota fue creada.',
    })
  }
}
