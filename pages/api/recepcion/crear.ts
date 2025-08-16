import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas } from '@/lib/schema'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Metodo no permitido' })
    return
  }

  const {
    empresa_id,
    agricultor_id,
    tipo_fruta_id,
    cantidad_cajas,
    peso_caja_oz,
    fecha_recepcion,
    usuario_recepcion_id,
    empaque_id,
    sector,
    marca,
    destino,
    tipo_produccion,
    variedad,
    notas: notasRecepcion
  } = req.body

  // Idempotencia (mismo click / retry)
  let idem = req.headers['x-idempotency-key']
  if (Array.isArray(idem)) idem = idem[0]
  if (!idem || typeof idem !== 'string') {
    // fallback si no llega encabezado (no recomendado)
    idem = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  try {
    // ¿Ya existe una recepcion con la misma llave?
    const yaExiste = await db
      .select({
        id: recepcion_fruta.id,
        numero_nota: recepcion_fruta.numero_nota
      })
      .from(recepcion_fruta)
      .where(sql`idempotency_key = ${idem}`)
      .limit(1)

    if (yaExiste.length) {
      return res.status(200).json({
        success: true,
        numero_nota: yaExiste[0].numero_nota,
        recepcionId: yaExiste[0].id,
        deduplicated: true
      })
    }

    if (!empresa_id || !tipo_fruta_id || !fecha_recepcion || !usuario_recepcion_id || !empaque_id || !cantidad_cajas || !peso_caja_oz) {
      res.status(400).json({ success: false, message: 'Faltan datos requeridos' })
      return
    }

    // Obtener siguiente numero de nota desde la SECUENCIA
    const nextRes: any = await db.execute(sql`SELECT nextval('numero_nota_seq') AS next`)
    const nextVal = nextRes?.rows?.[0]?.next ?? nextRes?.[0]?.next ?? nextRes?.[0]?.nextval
    const siguienteNumero = Number(nextVal)

    const insertData = {
      empresa_id: Number(empresa_id),
      agricultor_id: agricultor_id ? Number(agricultor_id) : null,
      tipo_fruta_id: Number(tipo_fruta_id),
      cantidad_cajas: Number(cantidad_cajas),
      peso_caja_oz: String(peso_caja_oz),
      fecha_recepcion: new Date(fecha_recepcion),
      usuario_recepcion_id: Number(usuario_recepcion_id),
      notas: typeof notasRecepcion === 'string' ? notasRecepcion.trim() : (notasRecepcion ? JSON.stringify(notasRecepcion) : ''),
      numero_nota: Number(siguienteNumero),
      empaque_id: Number(empaque_id),
      sector: sector || '',
      marca: marca || '',
      destino: destino || '',
      tipo_produccion: tipo_produccion || '',
      variedad: variedad || '',
      idempotency_key: idem
    }

    let recepcionId: number | null = null
    try {
      const created = await db.insert(recepcion_fruta).values(insertData).returning({ id: recepcion_fruta.id })
      recepcionId = created[0].id
    } catch (e: any) {
      // Si choca por idempotencia, devolver el ya creado
      const isUniqueViolation = e?.code === '23505'
      if (isUniqueViolation) {
        const row = await db
          .select({ id: recepcion_fruta.id, numero_nota: recepcion_fruta.numero_nota })
          .from(recepcion_fruta)
          .where(sql`idempotency_key = ${idem}`)
          .limit(1)
        if (row.length) {
          return res.status(200).json({ success: true, numero_nota: row[0].numero_nota, recepcionId: row[0].id, deduplicated: true })
        }
      }
      throw e
    }

    // Crear “nota de recepcion” y “nota de calidad” ligadas
    await db.insert(notas).values({
      titulo: 'Nota de recepcion',
      contenido: '',
      modulo: 'recepcion',
      relacion_id: recepcionId!,
      usuario_creacion_id: Number(usuario_recepcion_id)
    })
    await db.insert(notas).values({
      titulo: 'Nota de calidad',
      contenido: '',
      modulo: 'calidad',
      relacion_id: recepcionId!,
      usuario_creacion_id: Number(usuario_recepcion_id)
    })

    res.status(200).json({ success: true, numero_nota: siguienteNumero, recepcionId })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al registrar la recepcion' })
  }
}
