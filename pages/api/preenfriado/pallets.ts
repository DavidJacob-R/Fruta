import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

function objetivoTemp(empaque: string, fruta: string) {
  const k = (empaque || '').toLowerCase().trim()
  const f = (fruta || '').toLowerCase().trim()
  if (k === '6oz' || k === '6 oz') return { obj: 240, min: 240, max: 264, temp: 4 }
  if (k.includes('6oz') && k.includes('4x5')) return { obj: 240, min: 240, max: 264, temp: 4 }
  if (k === 'pinta') return { obj: 150, min: 144, max: 156, temp: 4 }
  if (k === '4.4oz' || k === '4_4oz' || k === '4.4 oz') return { obj: 195, min: 195, max: 195, temp: 4 }
  if (k === '8x1lb' || k === '8 x 1lb' || k === '8x1 lb') return { obj: 120, min: 108, max: 120, temp: f === 'fresa' ? 2 : 4 }
  if (k === '12oz' || k === '12 oz') return { obj: 150, min: 144, max: 180, temp: 4 }
  return { obj: 200, min: 200, max: 240, temp: 4 }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false })
    const q = await db.execute(sql`
      SELECT
        p.id,
        p.codigo_pallet,
        p.ubicacion_actual,
        p.fecha_creacion,
        subt.temperatura AS temp_final,
        MIN(tf.nombre) AS fruta,
        MIN(em.tamanio) AS empaque,
        COALESCE(SUM(pc.cantidad_cajas),0)::int AS cajas
      FROM pallets p
      LEFT JOIN pallet_cajas pc ON pc.pallet_id = p.id
      LEFT JOIN recepcion_fruta r ON r.id = pc.recepcion_id
      LEFT JOIN tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN empaques em ON em.id = r.empaque_id
      LEFT JOIN LATERAL (
        SELECT t.temperatura
        FROM temperaturas_preenfriado t
        WHERE t.pallet_id = p.id
        ORDER BY t.fecha_medicion DESC
        LIMIT 1
      ) AS subt ON true
      WHERE p.ubicacion_actual IN ('preenfriado','preenfriado_listo')
      GROUP BY p.id, p.codigo_pallet, p.ubicacion_actual, p.fecha_creacion, subt.temperatura
      ORDER BY p.id DESC
    `)
    const rows = (q as any).rows || []
    const data = rows.map((r: any) => {
      const regla = objetivoTemp(r.empaque || '', r.fruta || '')
      const estado = r.ubicacion_actual === 'preenfriado_listo' ? 'listo' : 'en_preenfriado'
      return {
        id: Number(r.id),
        codigo: r.codigo_pallet,
        fruta: r.fruta || '',
        empaque: r.empaque || '',
        cajas: Number(r.cajas),
        objetivo: regla.obj,
        completo: Number(r.cajas) >= regla.min && Number(r.cajas) <= regla.max,
        camara: 'Camara unica',
        temp_objetivo: regla.temp,
        inicio: new Date(r.fecha_creacion).getTime(),
        temp_final: r.temp_final === null ? null : Number(r.temp_final),
        estado
      }
    })
    res.status(200).json({ ok: true, pallets: data })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}
