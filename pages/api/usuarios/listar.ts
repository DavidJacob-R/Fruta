import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const q = await db.execute(sql`
      select 
        u.id, u.email, u.nombre, u.apellido, u.rol_id, u.activo, coalesce(r.nombre,'') as rol_nombre,
        coalesce(array_agg(distinct s.clave) filter (where s.id is not null), '{}') as secciones
      from usuarios u
      left join roles r on r.id = u.rol_id
      left join usuarios_secciones us on us.usuario_id = u.id and us.permitido = true
      left join secciones s on s.id = us.seccion_id
      group by u.id, r.nombre
      order by u.creado_en desc
    `)
    res.json({ usuarios: q.rows })
  } catch {
    res.status(500).json({ error: 'error' })
  }
}
