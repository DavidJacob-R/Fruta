import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { setDbActorFromReq } from "@/lib/db-actor"

import { sql } from 'drizzle-orm'

function genCodigo() {
  const d = new Date()
  const y = d.getFullYear().toString()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const n = Math.floor(1000 + Math.random() * 9000)
  return `PAL-${y}${m}${day}-${n}`
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await setDbActorFromReq(req)

    if (req.method !== 'POST') return res.status(405).json({ ok: false })
    const { pallets, usuario_id, tipo_pallet_id } = req.body || {}
    if (!Array.isArray(pallets) || pallets.length === 0) return res.status(400).json({ ok: false })
    const creados: any[] = []
    for (const pal of pallets) {
      const codigo = genCodigo()
      const ins = await db.execute(sql`
        INSERT INTO pallets (codigo_pallet, tipo_pallet_id, fecha_creacion, usuario_creacion_id, ubicacion_actual, notas)
        VALUES (${codigo}, ${tipo_pallet_id || null}, NOW(), ${usuario_id || null}, 'preenfriado', NULL)
        RETURNING id, codigo_pallet
      `)
      const pid = (ins as any).rows[0].id as number
      const usos: Array<{ recepcion_id: number; cajas: number }> = pal.pedidos || []
      for (const u of usos) {
        await db.execute(sql`
          INSERT INTO pallet_cajas (pallet_id, recepcion_id, cantidad_cajas)
          VALUES (${pid}, ${u.recepcion_id}, ${u.cajas})
        `)
      }
      creados.push({ id: pid, codigo_pallet: (ins as any).rows[0].codigo_pallet })
    }
    res.status(200).json({ ok: true, pallets: creados })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
