import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

function dur(ms: number) {
  if (ms < 0) ms = 0
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const hh = h > 0 ? `${h}h` : ''
  const mm = `${m}m`
  return `${hh} ${mm}`.trim()
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false })
    const q = await db.execute(sql`
      SELECT
        c.id AS conservacion_id,
        p.id AS pallet_id,
        p.codigo_pallet,
        p.fecha_creacion,
        c.fecha_entrada,
        c.temperatura_entrada,
        MIN(tf.nombre) AS fruta,
        MIN(em.tamanio) AS empaque,
        COALESCE(SUM(pc.cantidad_cajas),0)::int AS cajas
      FROM conservacion c
      JOIN pallets p ON p.id = c.pallet_id
      LEFT JOIN pallet_cajas pc ON pc.pallet_id = p.id
      LEFT JOIN recepcion_fruta r ON r.id = pc.recepcion_id
      LEFT JOIN tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN empaques em ON em.id = r.empaque_id
      WHERE c.fecha_salida IS NULL
      GROUP BY c.id, p.id, p.codigo_pallet, p.fecha_creacion, c.fecha_entrada, c.temperatura_entrada
      ORDER BY c.id DESC
    `)
    const rows = (q as any).rows || []
    const data = rows.map((r: any) => {
      const entrada = new Date(r.fecha_entrada).getTime()
      const inicio = new Date(r.fecha_creacion).getTime()
      const enf = dur(entrada - inicio)
      return {
        id: Number(r.pallet_id),
        codigo: r.codigo_pallet,
        fruta: r.fruta || '',
        empaque: r.empaque || '',
        cajas: Number(r.cajas),
        entryDate: new Date(entrada).toLocaleDateString(),
        entryTime: new Date(entrada).toLocaleTimeString(),
        coolingTime: enf,
        finalTemp: r.temperatura_entrada === null ? null : Number(r.temperatura_entrada)
      }
    })
    res.status(200).json({ ok: true, pallets: data })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
