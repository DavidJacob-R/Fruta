import { db } from '@/lib/db'
import { notas, recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Falta id' })

  const [nota] = await db.select().from(notas).where(eq(notas.id, Number(id)))
  if (!nota) return res.status(404).json({ error: 'Nota no encontrada' })

  const [recepcion] = await db.select().from(recepcion_fruta).where(eq(recepcion_fruta.id, Number(nota.relacion_id)))
  if (!recepcion) return res.status(404).json({ error: 'Recepción no encontrada' })

  res.status(200).json({ nota: recepcion })
}
