import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  const { codigo_caja } = req.body

  if (!codigo_caja) {
    return res.status(400).json({ success: false, message: 'Código de caja faltante' })
  }

  try {
    await db.query('DELETE FROM recepcion_fruta WHERE codigo_caja = ?', [codigo_caja])
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar el registro' })
  }
}
