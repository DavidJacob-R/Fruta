import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { email, pass, nombre, apellido, rol_id, activo } = req.body || {}
    const ins = await db.execute(sql`
      insert into usuarios (email, pass, nombre, apellido, rol_id, activo)
      values (${email}, ${pass}, ${nombre}, ${apellido}, ${rol_id}, ${activo})
      returning id
    `)
    res.json({ ok: true, id: ins.rows[0].id })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
