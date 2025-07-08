import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { tipos_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }
  const { id } = req.body
  if (!id) {
    return res.status(400).json({ success: false, message: 'ID de fruta requerido' })
  }

  try {
    await db.update(tipos_fruta).set({ activo: false }).where(eq(tipos_fruta.id, id))
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar fruta' })
  }
}
