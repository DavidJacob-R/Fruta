import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import { setDbActorFromReq } from "@/lib/db-actor"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await setDbActorFromReq(req)

    if (req.method !== 'POST') return res.status(405).json({ ok: false })
    const { pallet_ids, usuario_id, ubicacion } = req.body || {}
    if (!Array.isArray(pallet_ids) || pallet_ids.length === 0) return res.status(400).json({ ok: false })
    const ids = pallet_ids.map((x: any) => Number(x)).filter((x: any) => Number.isFinite(x))
    const inList = sql.join(ids.map(id => sql.raw(String(id))), sql.raw(', '))

    await db.execute(sql`
      INSERT INTO conservacion (pallet_id, fecha_entrada, ubicacion, temperatura_entrada, usuario_entrada_id, notas)
      SELECT
        p.id,
        NOW(),
        ${ubicacion || 'Camara unica'},
        lt.temperatura,
        ${usuario_id || null},
        NULL
      FROM pallets p
      LEFT JOIN LATERAL (
        SELECT t.temperatura
        FROM temperaturas_preenfriado t
        WHERE t.pallet_id = p.id
        ORDER BY t.fecha_medicion DESC
        LIMIT 1
      ) AS lt ON true
      WHERE p.id IN (${inList})
    `)

    await db.execute(sql`
      UPDATE pallets SET ubicacion_actual = 'conservacion' WHERE id IN (${inList})
    `)

    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
