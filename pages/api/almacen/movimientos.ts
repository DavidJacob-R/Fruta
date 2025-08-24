import type { NextApiRequest, NextApiResponse } from 'next'
import { pool } from '@/lib/db'

function mapTipo(t: string) {
  if (t === 'entradas') return 'entrada'
  if (t === 'salidas') return 'salida'
  return 'intercambio'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const limit = Math.min(200, Number(req.query.limit || 50))
      const q = `
        select
          id,
          tipo_movimiento as tipo,
          fecha_movimiento as fecha,
          material_nombre as material,
          (cantidad)::float8 as cantidad,
          origen,
          destino,
          proveedor_nombre as proveedor,
          agricultor_nombre as agricultor,
          unidad_medida as unidad,
          notas
        from public.vw_movimientos_detalle
        order by fecha desc, id desc
        limit $1
      `
      const { rows } = await pool.query(q, [limit])
      return res.status(200).json(rows)
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = req.body || {}
      const tipo_movimiento = mapTipo(String(body.tipo || ''))
      const tipo_material_id = Number(body.tipo_material_id || 0)
      const cantidad = Number(body.cantidad || 0)
      const proveedor_id = body.proveedor_id ? Number(body.proveedor_id) : null
      const agricultor_id = body.agricultor_id ? Number(body.agricultor_id) : null
      const origen = body.origen || null
      const destino = body.destino || null
      const notas = body.notas || null
      const fecha_iso = body.fecha_movimiento ? new Date(body.fecha_movimiento).toISOString() : new Date().toISOString()

      if (!tipo_movimiento || !tipo_material_id || !(cantidad > 0)) return res.status(400).json({ error: 'datos invalidos' })
      if (tipo_movimiento === 'entrada' && !proveedor_id) return res.status(400).json({ error: 'proveedor requerido' })
      if (tipo_movimiento === 'salida' && !agricultor_id) return res.status(400).json({ error: 'agricultor requerido' })

      const es_comprado = tipo_movimiento === 'entrada' ? true : null

      const q = `
        insert into public.movimientos_materiales
        (tipo_movimiento, tipo_material_id, cantidad, proveedor_id, agricultor_id, fecha_movimiento, origen, destino, notas, es_comprado)
        values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        returning id
      `
      const vals = [tipo_movimiento, tipo_material_id, cantidad, proveedor_id, agricultor_id, fecha_iso, origen, destino, notas, es_comprado]
      const { rows } = await pool.query(q, vals)
      return res.status(201).json({ id: rows[0]?.id })
    } catch {
      return res.status(400).json({ error: 'error' })
    }
  }

  return res.status(405).json({ error: 'metodo no permitido' })
}
