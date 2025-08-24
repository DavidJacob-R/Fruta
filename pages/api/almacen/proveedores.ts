import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'metodo no permitido' })
  try {
    const q = `
      select id, nombre
      from public.proveedores
      where coalesce(activo,true) = true
      order by nombre asc
    `
    const { rows } = await pool.query(q)
    return res.status(200).json(rows)
  } catch {
    return res.status(400).json({ error: 'error' })
  }
}
