// pages/api/recepcion/crear.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta, notas, usuarios } from '@/lib/schema'
import { sql, eq, and } from 'drizzle-orm'

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

  let idem = req.headers['x-idempotency-key']
  if (Array.isArray(idem)) idem = idem[0]
  if (!idem || typeof idem !== 'string') {
    idem = `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }

  try {
    // Dedupe optimista: si ya existe por idempotencia, regresar lo mismo
    const existente = await db
      .select({ id: recepcion_fruta.id, numero_nota: recepcion_fruta.numero_nota as any })
      .from(recepcion_fruta)
      .where(sql`idempotency_key = ${idem}`)
      .limit(1)

    if (existente.length) {
      // Intentar exponer URL del PDF si ya fue generado antes
      let pdf_url: string | null = null
      try {
        const uno = await db
          .select({ pdf: notas.pdf })
          .from(notas)
          .where(and(eq(notas.modulo as any, 'recepcion' as any), eq(notas.relacion_id, existente[0].id)))
          .limit(1)
        pdf_url = uno[0]?.pdf ?? null
      } catch {}
      res.status(200).json({
        success: true,
        numero_nota: Number(existente[0].numero_nota),
        recepcionId: existente[0].id,
        pdf_url,
        deduplicated: true
      })
      return
    }

    // Validaciones y normalizacion
    const empresaIdNum = Number(empresa_id)
    const tipoFrutaIdNum = Number(tipo_fruta_id)
    const cantidadCajasNum = Number(cantidad_cajas)
    const pesoCajaStr = String(peso_caja_oz)
    const usuarioIdNum = Number(usuario_recepcion_id)
    const empaqueIdNum = empaque_id != null ? Number(empaque_id) : null
    const agricultorIdNum = agricultor_id != null ? Number(agricultor_id) : null
    const fechaObj = new Date(fecha_recepcion)

    if (!Number.isFinite(empresaIdNum) || !Number.isFinite(tipoFrutaIdNum) || !Number.isFinite(cantidadCajasNum) || !pesoCajaStr || !Number.isFinite(usuarioIdNum) || !(fechaObj instanceof Date) || isNaN(fechaObj.getTime())) {
      res.status(400).json({ success: false, message: 'Datos invalidos' })
      return
    }

    // Usuario existe?
    const usr = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.id, usuarioIdNum)).limit(1)
    const userExists = usr.length > 0

    // Numero de nota por secuencia
    let numeroNotaFinal = 0
    try {
      const nextRes: any = await db.execute(sql`select nextval('numero_nota_seq') as next`)
      const rawNext = nextRes?.rows?.[0]?.next ?? nextRes?.[0]?.next ?? nextRes?.[0]?.nextval
      numeroNotaFinal = Number(rawNext)
      if (!Number.isFinite(numeroNotaFinal)) throw new Error('nextval invalido')
    } catch {
      // Ultimo recurso: MAX+1 (la unicidad del indice protegera de duplicados)
      const maxRes: any = await db.execute(sql`select coalesce(max(numero_nota), 0) + 1 as next from recepcion_fruta`)
      const rawNext = maxRes?.rows?.[0]?.next ?? maxRes?.[0]?.next
      numeroNotaFinal = Number(rawNext) || 1
    }

    let salidaRecepcionId = 0

    // Transaccion: insertar recepcion y sus dos notas base
    await db.transaction(async (tx) => {
      const created = await tx
        .insert(recepcion_fruta)
        .values({
          empresa_id: empresaIdNum,
          agricultor_id: agricultorIdNum,
          tipo_fruta_id: tipoFrutaIdNum,
          cantidad_cajas: cantidadCajasNum,
          peso_caja_oz: pesoCajaStr,
          fecha_recepcion: fechaObj as any,
          usuario_recepcion_id: usuarioIdNum,
          empaque_id: empaqueIdNum,
          sector: sector || '',
          marca: marca || '',
          destino: destino || '',
          tipo_produccion: tipo_produccion || '',
          variedad: variedad || '',
          notas: typeof notasRecepcion === 'string' ? notasRecepcion.trim() : (notasRecepcion ? JSON.stringify(notasRecepcion) : ''),
          idempotency_key: idem,
          numero_nota: numeroNotaFinal as any
        })
        .returning({ id: recepcion_fruta.id })

      const recId = created[0].id
      salidaRecepcionId = recId

      await tx.insert(notas).values({
        titulo: 'Nota de recepcion',
        contenido: '',
        modulo: 'recepcion' as any,
        relacion_id: recId,
        ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
      })

      await tx.insert(notas).values({
        titulo: 'Nota de calidad',
        contenido: '',
        modulo: 'calidad' as any,
        relacion_id: recId,
        ...(userExists ? { usuario_creacion_id: usuarioIdNum } : {})
      })
    })

    // Generar PDF en el servidor (no depender del cliente)
    let pdf_url: string | null = null
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const r = await fetch(`${base}/api/pdf/crea-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_nota: numeroNotaFinal, fecha: new Date().toLocaleDateString() })
      })
      const j = await r.json()
      pdf_url = j?.url ?? null

      if (pdf_url) {
        await db
          .update(notas)
          .set({ pdf: pdf_url })
          .where(and(eq(notas.modulo as any, 'recepcion' as any), eq(notas.relacion_id, salidaRecepcionId)))
      }
    } catch {}

    res.status(200).json({
      success: true,
      numero_nota: numeroNotaFinal,
      recepcionId: salidaRecepcionId,
      pdf_url
    })
  } catch (err: any) {
    // Si cayo por idempotencia, leer el existente y regresar
    if (String(err?.message || '').includes('recepcion_fruta_idem_unq') || String(err?.detail || '').includes('recepcion_fruta_idem_unq')) {
      try {
        const existente2 = await db
          .select({ id: recepcion_fruta.id, numero_nota: recepcion_fruta.numero_nota as any })
          .from(recepcion_fruta)
          .where(sql`idempotency_key = ${idem}`)
          .limit(1)
        if (existente2.length) {
          res.status(200).json({
            success: true,
            numero_nota: Number(existente2[0].numero_nota),
            recepcionId: existente2[0].id,
            deduplicated: true
          })
          return
        }
      } catch {}
    }

    console.error('API /api/recepcion/crear error:', err)
    res.status(500).json({
      success: false,
      message: 'Error al registrar la recepcion',
      code: err?.code ?? null,
      detail: err?.detail ?? null
    })
  }
}
