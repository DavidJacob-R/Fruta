import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

function normalizar(s: string) { return (s || '').toLowerCase().trim() }
function reglas(fruta: string, empaque: string) {
  const k = normalizar(empaque)
  if (k === '6oz' || k === '6 oz') return { min: 240, max: 264, obj: 240 }
  if (k.includes('6oz') && k.includes('4x5')) return { min: 240, max: 264, obj: 240 }
  if (k === 'pinta') return { min: 144, max: 156, obj: 150 }
  if (k === '4.4oz' || k === '4_4oz' || k === '4.4 oz') return { min: 195, max: 195, obj: 195 }
  if (k === '8x1lb' || k === '8 x 1lb' || k === '8x1 lb') return { min: 108, max: 120, obj: 120 }
  if (k === '12oz' || k === '12 oz') return { min: 144, max: 180, obj: 150 }
  return { min: 200, max: 240, obj: 200 }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method' })

    const { pallet_id, recepciones } = req.body || {}
    if (!pallet_id || !Array.isArray(recepciones) || recepciones.length === 0) {
      return res.status(400).json({ ok: false, error: 'payload' })
    }

    const qPal = await db.execute(sql`
      SELECT
        p.id,
        p.ubicacion_actual,
        MIN(tf.nombre) AS fruta,
        MIN(em.tamanio) AS empaque,
        COALESCE(SUM(pc.cantidad_cajas),0)::int AS cajas
      FROM pallets p
      LEFT JOIN pallet_cajas pc ON pc.pallet_id = p.id
      LEFT JOIN recepcion_fruta r ON r.id = pc.recepcion_id
      LEFT JOIN tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN empaques em ON em.id = r.empaque_id
      WHERE p.id = ${pallet_id}
      GROUP BY p.id, p.ubicacion_actual
    `)
    if (!(qPal as any).rows?.length) return res.status(404).json({ ok: false, error: 'pallet' })
    const pal = (qPal as any).rows[0]
    if (pal.ubicacion_actual !== 'preenfriado') return res.status(400).json({ ok: false, error: 'estado' })

    let fruta = pal.fruta as string | null
    let empaque = pal.empaque as string | null

    const ids = recepciones.map((r: any) => Number(r.recepcion_id)).filter((x: any) => Number.isFinite(x))
    if (ids.length === 0) return res.status(400).json({ ok: false, error: 'recepciones' })
    const inList = sql.join(ids.map((id) => sql`${id}`), sql`,`)
    const qRec = await db.execute(sql`
      SELECT r.id, tf.nombre AS fruta, em.tamanio AS empaque
      FROM recepcion_fruta r
      JOIN tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN empaques em ON em.id = r.empaque_id
      WHERE r.id IN (${inList})
    `)
    const recs = (qRec as any).rows || []
    if (!fruta || !empaque) {
      if (recs.length === 0) return res.status(400).json({ ok: false, error: 'sin_ref_empaque' })
      fruta = recs[0].fruta || ''
      empaque = recs[0].empaque || ''
    }
    for (const r of recs) {
      if (normalizar(r.fruta) !== normalizar(fruta || '') || normalizar(r.empaque) !== normalizar(empaque || '')) {
        return res.status(400).json({ ok: false, error: 'no_compatibles' })
      }
    }

    const regla = reglas(fruta || '', empaque || '')
    const sumar = recepciones.reduce((a: number, x: any) => a + Number(x.cajas || 0), 0)
    const total = Number(pal.cajas || 0) + sumar
    if (total > regla.max) return res.status(400).json({ ok: false, error: 'excede_maximo' })

    await db.transaction(async (tx) => {
      for (const it of recepciones) {
        const rid = Number(it.recepcion_id)
        const cx = Number(it.cajas)
        if (!Number.isFinite(rid) || !Number.isFinite(cx) || cx <= 0) continue
        const upd = await tx.execute(sql`
          UPDATE pallet_cajas
          SET cantidad_cajas = cantidad_cajas + ${cx}
          WHERE pallet_id = ${pallet_id} AND recepcion_id = ${rid}
        `)
        if ((upd as any).rowCount === 0) {
          await tx.execute(sql`
            INSERT INTO pallet_cajas (pallet_id, recepcion_id, cantidad_cajas)
            VALUES (${pallet_id}, ${rid}, ${cx})
          `)
        }
      }
    })

    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('agregar-existente error:', e)
    return res.status(500).json({ ok: false, error: 'server' })
  }
}
