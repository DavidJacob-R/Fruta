import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { rol_id, secciones } = req.body || {}
    await db.execute(sql`delete from roles_secciones where rol_id=${rol_id}`)
    if (Array.isArray(secciones) && secciones.length > 0) {
      for (const sid of secciones) {
        await db.execute(sql`insert into roles_secciones (rol_id, seccion_id) values (${rol_id}, ${sid})`)
      }
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
