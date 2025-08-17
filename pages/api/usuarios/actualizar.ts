import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { id, email, pass, nombre, apellido, rol_id, activo } = req.body || {}
    if (pass && pass.length > 0) {
      await db.execute(sql`
        update usuarios set email=${email}, pass=${pass}, nombre=${nombre}, apellido=${apellido}, rol_id=${rol_id}, activo=${activo}, actualizado_en=now()
        where id=${id}
      `)
    } else {
      await db.execute(sql`
        update usuarios set email=${email}, nombre=${nombre}, apellido=${apellido}, rol_id=${rol_id}, activo=${activo}, actualizado_en=now()
        where id=${id}
      `)
    }
    res.json({ ok: true })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
