import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas, usuarios } from '@/lib/schema'
import { sql, eq, and } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Metodo no permitido' })
    return
  }

  // Extrae body
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
    // Si ya existe por idempotencia, devolvemos el mismo resultado
    const existente = await db
      .select({ id: recepcion_fruta.id })
      .from(recepcion_fruta)
      .where(sql`idempotency_key = ${idem}`)
      .limit(1)

    if (existente.length) {
      const notaRec = await db
        .select({ id: notas.id })
        .from(notas)
        .where(and(eq(notas.modulo, 'recepcion'), eq(notas.relacion_id, existente[0].id)))
        .limit(1)
      const numero_nota = notaRec.length ? notaRec[0].id : existente[0].id
      res.status(200).json({ success: true, numero_nota, recepcionId: existente[0].id, deduplicated: true })
      return
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

    // Verifica si el usuario existe (evita FK al crear notas)
    const usr = await db
      .select({ id: usuarios.id })
      .from(usuarios)
      .where(eq(usuarios.id, usuarioIdNum))
      .limit(1)
    const userExists = usr.length > 0

    // Transacción: crear recepcion y notas
    let salidaNumeroNota = 0
    let salidaRecepcionId = 0

    await db.transaction(async (tx) => {
      // Intento de inserción de recepción
      let recId: number

      try {
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
            idempotency_key: idem
          })
          .returning({ id: recepcion_fruta.id })

        recId = created[0].id
      } catch (e: any) {
        // Si es unique violation por idempotencia, recupera
        if (e?.code === '23505') {
          const row = await tx
            .select({ id: recepcion_fruta.id })
            .from(recepcion_fruta)
            .where(sql`idempotency_key = ${idem}`)
            .limit(1)
          if (row.length) {
            const notaRec = await tx
              .select({ id: notas.id })
              .from(notas)
              .where(and(eq(notas.modulo, 'recepcion'), eq(notas.relacion_id, row[0].id)))
              .limit(1)
            const numero_nota = notaRec.length ? notaRec[0].id : row[0].id
            salidaNumeroNota = numero_nota
            salidaRecepcionId = row[0].id
            return
          }
        }
        throw e
      }

      // Si ya resolvimos por idempotencia arriba, salimos (no crear notas otra vez)
      if (salidaRecepcionId && salidaNumeroNota) return

      // Inserta Nota de Recepción
      const createdNotaRec = await tx
        .insert(notas)
        .values({
          titulo: 'Nota de recepcion',
          contenido: '',
          modulo: 'recepcion',
          relacion_id: recId,
          ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
        })
        .returning({ id: notas.id })

      // Inserta Nota de Calidad
      await tx.insert(notas).values({
        titulo: 'Nota de calidad',
        contenido: '',
        modulo: 'calidad',
        relacion_id: recId,
        ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
      })

      salidaNumeroNota = createdNotaRec[0].id
      salidaRecepcionId = recId
    })

    if (!salidaRecepcionId || !salidaNumeroNota) {
      // Esto solo ocurriría si hubo un error no atrapado dentro de la transacción
      res.status(500).json({ success: false, message: 'No fue posible completar la transaccion' })
      return
    }

    res.status(200).json({ success: true, numero_nota: salidaNumeroNota, recepcionId: salidaRecepcionId })
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
