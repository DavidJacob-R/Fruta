import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const roles = await db.execute(sql`select id, nombre, descripcion from roles order by id asc`)
    res.json({ roles: roles.rows })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
