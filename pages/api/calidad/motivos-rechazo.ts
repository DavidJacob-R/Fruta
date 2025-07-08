import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await db.execute(
      sql`SELECT id, motivo FROM motivos_rechazo WHERE activo = TRUE`
    )
    res.status(200).json({ motivos: result.rows })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}
