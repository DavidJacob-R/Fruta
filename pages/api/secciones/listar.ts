import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const secciones = await db.execute(sql`select id, clave, titulo from secciones order by id asc`)
    res.json({ secciones: secciones.rows })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
