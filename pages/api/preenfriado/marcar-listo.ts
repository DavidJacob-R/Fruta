import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ ok: false })
    const { pallet_id, temp_final, usuario_id } = req.body || {}
    if (!pallet_id) return res.status(400).json({ ok: false })
    await db.execute(sql`
      INSERT INTO temperaturas_preenfriado (pallet_id, temperatura, fecha_medicion, usuario_medicion_id, notas)
      VALUES (${pallet_id}, ${temp_final ?? null}, NOW(), ${usuario_id || null}, 'listo')
    `)
    await db.execute(sql`
      UPDATE pallets SET ubicacion_actual = 'preenfriado_listo' WHERE id = ${pallet_id}
    `)
    res.status(200).json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
