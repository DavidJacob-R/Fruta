import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { db } from '@/lib/db'
import { recepcion_fruta, tipos_fruta, empaques, empresa, agricultores_empresa } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { sql } from 'drizzle-orm/sql'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function sanitize(v: string) {
  if (!v) return ''
  return String(v).replace(/[,\(\)\[\]\{\}\|;:]/g, '').replace(/\s+/g, ' ').trim()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { numero_nota, fecha } = req.body
    const numeroNotaNum = Number(numero_nota)
    if (!Number.isFinite(numeroNotaNum)) {
      return res.status(400).json({ error: 'numero_nota invalido' })
    }

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
        empresa_id: recepcion_fruta.empresa_id,
        agricultor_nombre: agricultores_empresa.nombre,
        agricultor_clave: agricultores_empresa.clave
      })
      .from(recepcion_fruta)
      .leftJoin(tipos_fruta, eq(recepcion_fruta.tipo_fruta_id, tipos_fruta.id))
      .leftJoin(empaques, eq(recepcion_fruta.empaque_id, empaques.id))
      .leftJoin(agricultores_empresa, eq(recepcion_fruta.agricultor_id, agricultores_empresa.id))
      .where(eq(recepcion_fruta.numero_nota as any, numeroNotaNum))

    if (!registros.length) {
      return res.status(404).json({ error: 'No existen pedidos con ese numero de nota' })
    }

    let nombreEmpresa = ''
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

    let nombreAgricultor = sanitize(registros[0].agricultor_nombre || '')
    let claveAgricultor = sanitize(registros[0].agricultor_clave || '')

    const lineasFruta = registros.map(r => {
      const partes = [
        sanitize(r.fruta || ''),
        r.cantidad != null ? sanitize(String(r.cantidad)) : '',
        r.cantidad != null ? 'cajas' : '',
        sanitize(r.empaque || ''),
        sanitize(r.variedad || ''),
        sanitize(r.tipo_produccion || '')
      ].filter(Boolean)
      return partes.join(' ')
    })

    const sectorTexto = Array.from(new Set(registros.map(r => sanitize(r.sector || '')).filter(Boolean))).join(' ')
    const marcaTexto = Array.from(new Set(registros.map(r => sanitize(r.marca || '')).filter(Boolean))).join(' ')
    const destinoTexto = Array.from(new Set(registros.map(r => sanitize(r.destino || '')).filter(Boolean))).join(' ')
    const notasTexto = registros.map(r => sanitize(r.notas || '')).filter(Boolean).join(' ')

    const pdfPath = path.resolve(process.cwd(), 'pages/api/pdf/Nota.pdf')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const page = pdfDoc.getPages()[0]

    page.drawText(sanitize(String(numero_nota)), { x: 65, y: 770, size: 12 })
    page.drawText(sanitize(fecha || ''), { x: 185, y: 770, size: 12 })
    page.drawText(sanitize(nombreEmpresa || ''), { x: 43, y: 755, size: 12 })

    if (nombreAgricultor) page.drawText(nombreAgricultor, { x: 43, y: 740, size: 12 })
    if (claveAgricultor) page.drawText(claveAgricultor, { x: 360, y: 740, size: 12 })

    let y = 710
    for (const linea of lineasFruta) {
      if (!linea) continue
      page.drawText(linea, { x: 43, y, size: 12 })
      y -= 15
    }

    if (sectorTexto) {
      page.drawText(sectorTexto, { x: 43, y, size: 12 })
      y -= 15
    }
    if (marcaTexto) {
      page.drawText(marcaTexto, { x: 43, y, size: 12 })
      y -= 15
    }
    if (destinoTexto) {
      page.drawText(destinoTexto, { x: 43, y, size: 12 })
      y -= 15
    }
    if (notasTexto) {
      page.drawText(notasTexto, { x: 43, y, size: 12 })
      y -= 15
    }

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
    return res.status(200).json({
      success: true,
      warning: 'No se pudo generar o subir el PDF pero la nota fue creada'
    })
  }
}
