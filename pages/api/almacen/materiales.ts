import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const q = `
        select
          tipo_material_id as id,
          nombre,
          unidad_medida as unidad,
          (cantidad)::float8 as cantidad
        from public.vw_inventario_material
        order by nombre asc
      `
      const { rows } = await pool.query(q)
      return res.status(200).json(rows)
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }
  if (req.method === 'POST') {
    try {
      const { nombre, descripcion, unidad_medida } = req.body || {}
      if (!nombre || !unidad_medida) return res.status(400).json({ error: 'faltan campos' })
      const q = `
        insert into public.tipos_material (nombre, descripcion, unidad_medida, activo)
        values ($1,$2,$3,true)
        returning id, nombre, unidad_medida as unidad
      `
      const { rows } = await pool.query(q, [nombre, descripcion || null, unidad_medida])
      return res.status(201).json(rows[0])
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }
  return res.status(405).json({ error: 'metodo no permitido' })
}
