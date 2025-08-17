import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { usuario_id, secciones } = req.body || {}
    await db.execute(sql`delete from usuarios_secciones where usuario_id=${usuario_id}`)
    if (Array.isArray(secciones) && secciones.length > 0) {
      for (const sid of secciones) {
        await db.execute(sql`insert into usuarios_secciones (usuario_id, seccion_id, permitido) values (${usuario_id}, ${sid}, true)`)
      }
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
