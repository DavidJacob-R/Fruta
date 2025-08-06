import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Método no permitido' })

  const {
    agricultor_id,
    empresa_id,
    tipo_fruta_id,
    cantidad_cajas,
    fecha_recepcion,
    usuario_recepcion_id,
    notas: notasRecepcion,
    tipo_nota,
    empaque_id,
    sector,
    marca,
    destino,
    tipo_produccion,
    variedad
  } = req.body

  try {
    const cajas = Number(cantidad_cajas) > 0 ? Number(cantidad_cajas) : 1
    if (!tipo_fruta_id || !fecha_recepcion || !usuario_recepcion_id || !tipo_nota || !empaque_id) {
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
      peso_caja_oz: req.body.peso_caja_oz || '',
      fecha_recepcion: new Date(fecha_recepcion),
      usuario_recepcion_id: Number(usuario_recepcion_id),
      notas: typeof notasRecepcion === 'string' ? notasRecepcion.trim() : (notasRecepcion ? JSON.stringify(notasRecepcion) : ''),
      tipo_nota: String(tipo_nota),
      numero_nota: siguienteNumero,
      empaque_id: empaque_id ? Number(empaque_id) : null,
      agricultor_id: null,
      empresa_id: null,
      sector: sector || '',
      marca: marca || '',
      destino: destino || '',
      tipo_produccion: tipo_produccion || '',
      variedad: variedad || ''
    }

    if (tipo_nota === 'empresa') {
      insertData.empresa_id = Number(empresa_id)
      insertData.agricultor_id = null
    } else {
      insertData.agricultor_id = Number(agricultor_id)
      insertData.empresa_id = null
    }

    const [recepcionCreada] = await db.insert(recepcion_fruta).values(insertData).returning({ id: recepcion_fruta.id })
    const recepcionId = recepcionCreada.id

    // Crear nota de recepción
    await db.insert(notas).values({
      titulo: 'Nota de recepción',
      contenido: '',
      modulo: 'recepcion',
      relacion_id: recepcionId,
      usuario_creacion_id: Number(usuario_recepcion_id),
    })

    // Crear nota de calidad
    await db.insert(notas).values({
      titulo: 'Nota de calidad',
      contenido: '',
      modulo: 'calidad',
      relacion_id: recepcionId,
      usuario_creacion_id: Number(usuario_recepcion_id),
    })

    res.status(200).json({ success: true, numero_nota: siguienteNumero, recepcionId })
  } catch (error: any) {
    const errorCode = error.code || error.cause?.code
    if (errorCode === '23505') {
      return res.status(400).json({ success: false, message: 'Ya existe un registro con esos datos.' })
    }
    res.status(500).json({ success: false, message: 'Error al registrar la recepción' })
  }
}
