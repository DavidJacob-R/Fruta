import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows]: any = await db.query('SELECT id, motivo FROM motivos_rechazo WHERE activo = TRUE')
    res.status(200).json({ motivos: rows })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}
