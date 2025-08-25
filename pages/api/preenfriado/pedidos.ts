import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false })
    const q = await db.execute(sql`
      SELECT
        r.id AS recepcion_id,
        tf.nombre AS fruta,
        em.tamanio AS empaque,
        ae.nombre AS agricultor,
        GREATEST(c.cajas_aprobadas - COALESCE(SUM(pc.cantidad_cajas),0),0)::int AS cajas_disponibles
      FROM recepcion_fruta r
      JOIN control_calidad c ON c.recepcion_id = r.id AND c.pasa_calidad = true
      LEFT JOIN pallet_cajas pc ON pc.recepcion_id = r.id
      JOIN tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN empaques em ON em.id = r.empaque_id
      LEFT JOIN agricultores_empresa ae ON ae.id = r.agricultor_id
      GROUP BY r.id, tf.nombre, em.tamanio, ae.nombre, c.cajas_aprobadas
      HAVING GREATEST(c.cajas_aprobadas - COALESCE(SUM(pc.cantidad_cajas),0),0) > 0
      ORDER BY r.id DESC
    `)
    const rows = (q as any).rows || []
    const data = rows.map((r: any) => ({
      id: Number(r.recepcion_id),
      fruta: r.fruta || '',
      empaque: r.empaque || '',
      cajas: Number(r.cajas_disponibles),
      origen: r.agricultor || 'varios'
    }))
    res.status(200).json({ ok: true, pedidos: data })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
