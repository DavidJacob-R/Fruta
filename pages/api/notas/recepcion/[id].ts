import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const notaId = Number(Array.isArray(id) ? id[0] : id)
  if (!notaId || Number.isNaN(notaId)) {
    res.status(400).json({ success: false, error: 'id invalido' })
    return
  }

  try {
    const nrows = await db.select().from(notas).where(eq(notas.id, notaId)).limit(1)
    if (nrows.length === 0) {
      res.status(404).json({ success: false, error: 'nota no encontrada' })
      return
    }
    const n = nrows[0] as any
    const rrows = n.relacion_id
      ? await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(n.relacion_id))).limit(1)
      : []
    const r = rrows.length ? rrows[0] : null

    res.status(200).json({
      success: true,
      nota: {
        id: n.id,
        modulo: n.modulo,
        relacion_id: n.relacion_id,
        numero_nota: r?.numero_nota ?? null
      }
    })
  } catch {
    res.status(500).json({ success: false, error: 'error del servidor' })
  }
}
