import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Metodo no permitido' })
    return
  }

  const { id } = req.query
  const raw = Array.isArray(id) ? id[0] : id
  if (!raw || typeof raw !== 'string') {
    res.status(400).json({ error: 'Falta id' })
    return
  }

  const idNum = Number(raw)
  if (!Number.isFinite(idNum)) {
    res.status(400).json({ error: 'Id invalido' })
    return
  }

  try {
    const rows = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, idNum)).limit(1)
    if (!rows.length) {
      res.status(404).json({ error: 'No encontrada' })
      return
    }
    res.status(200).json({ nota: rows[0] })
  } catch {
    res.status(500).json({ error: 'Error de servidor' })
  }
}
