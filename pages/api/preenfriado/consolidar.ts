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

    const { source_id, target_id, cajas } = req.body || {}
    const src = Number(source_id)
    const dst = Number(target_id)
    let moveReq = Number(cajas)

    if (!Number.isFinite(src) || !Number.isFinite(dst) || src === dst) {
      return res.status(400).json({ ok: false, error: 'ids_invalidos' })
    }

    // Regla del cliente: consolidación manual de 1 a 10 cajas
    if (!Number.isFinite(moveReq) || moveReq < 1) moveReq = 1
    if (moveReq > 10) moveReq = 10

    // Traer pallets A y B (en preenfriado) y su fruta/empaque/cajas
    const idsList = [src, dst]
    const inList = sql.join(idsList.map((id) => sql`${id}`), sql`,`)
    const q = await db.execute(sql`
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
      WHERE p.id IN (${inList})
      GROUP BY p.id, p.ubicacion_actual
    `)

    const arr = (q as any).rows || []
    const A = arr.find((x: any) => Number(x.id) === src)
    const B = arr.find((x: any) => Number(x.id) === dst)

    if (!A || !B) return res.status(404).json({ ok: false, error: 'pallet_no_encontrado' })
    if (A.ubicacion_actual !== 'preenfriado' || B.ubicacion_actual !== 'preenfriado') {
      return res.status(400).json({ ok: false, error: 'estado_no_permitido' })
    }
    if (normalizar(A.fruta) !== normalizar(B.fruta) || normalizar(A.empaque) !== normalizar(B.empaque)) {
      return res.status(400).json({ ok: false, error: 'no_compatibles' })
    }

    const regla = reglas(A.fruta || '', A.empaque || '')
    const disponible = Number(A.cajas || 0)
    const espacio = Math.max(0, regla.max - Number(B.cajas || 0))
    const mover = Math.min(moveReq, disponible, espacio)
    if (mover <= 0) return res.status(400).json({ ok: false, error: 'sin_espacio_o_disponible' })

    // Transacción: mover por recepciones (FIFO: las filas con más cajas primero)
    const moved = await db.transaction(async (tx) => {
      const filas = await tx.execute(sql`
        SELECT recepcion_id, cantidad_cajas
        FROM pallet_cajas
        WHERE pallet_id = ${src}
        ORDER BY cantidad_cajas DESC
        FOR UPDATE
      `)
      let pendiente = mover
      for (const r of (filas as any).rows || []) {
        if (pendiente <= 0) break
        const rid = Number(r.recepcion_id)
        const cx = Number(r.cantidad_cajas)
        const take = Math.min(cx, pendiente)

        // Restar al origen
        await tx.execute(sql`
          UPDATE pallet_cajas
          SET cantidad_cajas = cantidad_cajas - ${take}
          WHERE pallet_id = ${src} AND recepcion_id = ${rid}
        `)
        await tx.execute(sql`
          DELETE FROM pallet_cajas
          WHERE pallet_id = ${src} AND recepcion_id = ${rid} AND cantidad_cajas <= 0
        `)

        // Sumar en destino (merge si ya existe esa recepcion)
        const upd = await tx.execute(sql`
          UPDATE pallet_cajas
          SET cantidad_cajas = cantidad_cajas + ${take}
          WHERE pallet_id = ${dst} AND recepcion_id = ${rid}
        `)
        if ((upd as any).rowCount === 0) {
          await tx.execute(sql`
            INSERT INTO pallet_cajas (pallet_id, recepcion_id, cantidad_cajas)
            VALUES (${dst}, ${rid}, ${take})
          `)
        }

        pendiente -= take
      }
      const efectivas = mover - Math.max(0, pendiente)
      return efectivas
    })

    if (moved <= 0) return res.status(400).json({ ok: false, error: 'no_se_pudo_mover' })
    return res.status(200).json({ ok: true, movidas: moved })
  } catch (e) {
    console.error('consolidar error:', e)
    return res.status(500).json({ ok: false, error: 'server' })
  }
}
