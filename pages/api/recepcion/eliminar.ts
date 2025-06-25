import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { recepcion_fruta } from '../../../lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { codigo_caja } = req.body
  try {
    await db.delete(recepcion_fruta).where(eq(recepcion_fruta.codigo_caja, codigo_caja))
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar la recepción' })
  }
}
