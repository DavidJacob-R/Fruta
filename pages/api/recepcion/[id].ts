import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Falta id' })
  const [nota] = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(id)))
  if (!nota) return res.status(404).json({ error: 'No encontrada' })
  res.status(200).json({ nota })
}
