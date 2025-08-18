// pages/api/recepcion/crear.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas, usuarios } from '@/lib/schema'
import { sql, and, eq } from 'drizzle-orm'

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
  } = req.body || {}

  // Idempotencia
  let idem = req.headers['x-idempotency-key']
  if (Array.isArray(idem)) idem = idem[0]
  if (!idem || typeof idem !== 'string') {
    idem = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  try {
    // Si ya existe por idempotencia => devolver mismo resultado
    const existente = await db
      .select({
        id: recepcion_fruta.id,
        numero_nota: recepcion_fruta.numero_nota as any
      })
      .from(recepcion_fruta)
      .where(sql`idempotency_key = ${idem}`)
      .limit(1)

    if (existente.length) {
      return res.status(200).json({
        success: true,
        numero_nota: Number(existente[0].numero_nota),
        recepcionId: existente[0].id,
        deduplicated: true
      })
    }

    // Normalización y validación
    const empresaIdNum = Number(empresa_id)
    const agricultorIdNum = agricultor_id ? Number(agricultor_id) : null
    const tipoFrutaIdNum = Number(tipo_fruta_id)
    const cantidadCajasNum = Number(cantidad_cajas)
    const empaqueIdNum = Number(empaque_id)
    const usuarioIdNum = Number(usuario_recepcion_id)
    const fechaObj = fecha_recepcion ? new Date(fecha_recepcion) : null
    const pesoCajaStr = String(peso_caja_oz ?? '')

    if (
      !Number.isFinite(empresaIdNum) ||
      !Number.isFinite(tipoFrutaIdNum) ||
      !Number.isFinite(cantidadCajasNum) ||
      !Number.isFinite(empaqueIdNum) ||
      !Number.isFinite(usuarioIdNum) ||
      !fechaObj ||
      !pesoCajaStr
    ) {
      res.status(400).json({ success: false, message: 'Faltan datos requeridos o son inválidos' })
      return
    }

    // Verifica existencia de usuario para evitar FK en notas
    const usr = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.id, usuarioIdNum))
      .limit(1)
    const userExists = usr.length > 0

    // Generar numero_nota
    let numeroNotaFinal = 0
    try {
      const nextRes: any = await db.execute(sql`SELECT nextval('numero_nota_seq') AS next`)
      const rawNext = nextRes?.rows?.[0]?.next ?? nextRes?.[0]?.next ?? nextRes?.[0]?.nextval
      numeroNotaFinal = Number(rawNext)
      if (!Number.isFinite(numeroNotaFinal)) throw new Error('nextval invalido')
    } catch {
      // Fallback si la secuencia no existe: MAX(numero_nota)+1 (no perfecto, pero desbloquea)
      const maxRes: any = await db.execute(sql`SELECT COALESCE(MAX(numero_nota), 0) + 1 AS next FROM recepcion_fruta`)
      const rawNext = maxRes?.rows?.[0]?.next ?? maxRes?.[0]?.next
      numeroNotaFinal = Number(rawNext) || 1
    }

    let salidaRecepcionId = 0

    await db.transaction(async (tx) => {
      // Insert en recepcion_fruta incluyendo numero_nota
      const created = await tx
        .insert(recepcion_fruta)
        .values({
          empresa_id: empresaIdNum,
          agricultor_id: agricultorIdNum,
          tipo_fruta_id: tipoFrutaIdNum,
          cantidad_cajas: cantidadCajasNum,
          peso_caja_oz: pesoCajaStr,
          fecha_recepcion: fechaObj,
          usuario_recepcion_id: usuarioIdNum,
          empaque_id: empaqueIdNum,
          sector: sector || '',
          marca: marca || '',
          destino: destino || '',
          tipo_produccion: tipo_produccion || '',
          variedad: variedad || '',
          notas: typeof notasRecepcion === 'string'
            ? notasRecepcion.trim()
            : (notasRecepcion ? JSON.stringify(notasRecepcion) : ''),
          idempotency_key: idem,
          // 👇 clave: guardar el numero_nota
          numero_nota: numeroNotaFinal as any
        })
        .returning({ id: recepcion_fruta.id })

      const recId = created[0].id
      salidaRecepcionId = recId

      // Nota de recepción
      await tx.insert(notas).values({
        titulo: 'Nota de recepcion',
        contenido: '',
        modulo: 'recepcion',
        relacion_id: recId,
        ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
      })

      // Nota de calidad
      await tx.insert(notas).values({
        titulo: 'Nota de calidad',
        contenido: '',
        modulo: 'calidad',
        relacion_id: recId,
        ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
      })
    })

    return res.status(200).json({
      success: true,
      numero_nota: numeroNotaFinal,
      recepcionId: salidaRecepcionId
    })
  } catch (err: any) {
    console.error('API /api/recepcion/crear error:', err)
    res.status(500).json({
      success: false,
      message: 'Error al registrar la recepcion',
      code: err?.code ?? null,
      detail: err?.detail ?? null
    })
  }
}
