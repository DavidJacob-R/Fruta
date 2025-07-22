import { db } from '@/lib/db'
import { notas } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (req.method !== 'POST') return res.status(405).json({ success: false })
  if (!id) return res.status(400).json({ success: false, message: 'Falta id' })

  const body = req.body
  try {
    await db.update(notas)
      .set({
        titulo: body.titulo ?? '',
        contenido: body.contenido ?? '',
      })
      .where(eq(notas.id, Number(id)))
    res.status(200).json({ success: true })
  } catch {
    res.status(500).json({ success: false, message: 'Error al actualizar nota de calidad' })
  }
}
