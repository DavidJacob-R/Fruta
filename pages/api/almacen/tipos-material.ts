import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const q = `
        select
          tm.id,
          tm.nombre,
          tm.descripcion,
          tm.unidad_medida,
          tm.activo,
          coalesce(im.cantidad_disponible,0)::float8 as cantidad
        from public.tipos_material tm
        left join public.inventario_materiales im on im.tipo_material_id = tm.id
        order by tm.nombre asc
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
        returning id, nombre, descripcion, unidad_medida, activo
      `
      const { rows } = await pool.query(q, [nombre, descripcion || null, unidad_medida])
      const id = rows[0]?.id
      if (id) {
        await pool.query('select public.ensure_inventario_row($1)', [id])
      }
      return res.status(201).json(rows[0])
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, nombre, descripcion, unidad_medida, activo } = req.body || {}
      if (!id) return res.status(400).json({ error: 'id requerido' })
      const sets: string[] = []
      const vals: any[] = []
      let i = 1
      if (typeof nombre === 'string') { sets.push(`nombre = $${i++}`); vals.push(nombre) }
      if (typeof descripcion !== 'undefined') { sets.push(`descripcion = $${i++}`); vals.push(descripcion) }
      if (typeof unidad_medida === 'string') { sets.push(`unidad_medida = $${i++}`); vals.push(unidad_medida) }
      if (typeof activo === 'boolean') { sets.push(`activo = $${i++}`); vals.push(activo) }
      if (sets.length === 0) return res.status(400).json({ error: 'sin cambios' })
      vals.push(id)
      const q = `update public.tipos_material set ${sets.join(', ')} where id = $${i} returning id`
      const { rows } = await pool.query(q, vals)
      return res.status(200).json({ id: rows[0]?.id })
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id || 0) || Number((req.body || {}).id || 0)
    const force = String((req.query.force ?? (req.body || {}).force) ?? '0') === '1'
    if (!id) return res.status(400).json({ error: 'id requerido' })

    const client = await pool.connect()
    try {
      await client.query('begin')

      const { rows: movCountRows } = await client.query(
        'select count(*)::int as c from public.movimientos_materiales where tipo_material_id = $1',
        [id]
      )
      const movCount = movCountRows[0]?.c || 0

      if (movCount > 0 && !force) {
        await client.query('rollback')
        return res.status(409).json({ error: 'no se puede eliminar: existen movimientos. usa force=1 para borrado definitivo' })
      }

      if (force) {
        await client.query('delete from public.movimientos_materiales where tipo_material_id = $1', [id])
      }

      await client.query('delete from public.inventario_materiales where tipo_material_id = $1', [id])

      const { rowCount } = await client.query('delete from public.tipos_material where id = $1', [id])
      if (rowCount === 0) {
        await client.query('rollback')
        return res.status(404).json({ error: 'no encontrado' })
      }

      await client.query('commit')
      return res.status(200).json({ id })
    } catch {
      await client.query('rollback')
      return res.status(400).json({ error: 'error' })
    } finally {
      client.release()
    }
  }

  return res.status(405).json({ error: 'metodo no permitido' })
}
