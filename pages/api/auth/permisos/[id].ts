import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const usuarioId = Number(id)
  if (!usuarioId) return res.status(400).json({ ok:false, error:'id invalido' })
  try {
    const rs = await db.execute(sql`
      select s.clave
      from usuarios u
      join roles r on r.id = u.rol_id
      left join roles_secciones rs2 on rs2.rol_id = r.id
      left join secciones s on s.id = rs2.seccion_id
      where u.id = ${usuarioId}
      union
      select s2.clave
      from usuarios_secciones us
      join secciones s2 on s2.id = us.seccion_id
      where us.usuario_id = ${usuarioId} and us.permitido = true
    `)
    const claves = Array.from(new Set((rs.rows as any[]).map(r => r.clave).filter(Boolean)))
    return res.status(200).json({ ok:true, claves })
  } catch {
    return res.status(500).json({ ok:false, error:'server' })
  }
}
