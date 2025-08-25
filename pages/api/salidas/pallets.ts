import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false })

    // Pallets que están en conservacion (sin fecha_salida)
    const q = await db.execute(sql`
      SELECT
        p.id,
        p.codigo_pallet,
        COALESCE(NULLIF(string_agg(DISTINCT e.empresa, ', '), ''), 'N/I') AS empresa
      FROM conservacion c
      JOIN pallets p ON p.id = c.pallet_id
      LEFT JOIN pallet_cajas pc ON pc.pallet_id = p.id
      LEFT JOIN recepcion_fruta r ON r.id = pc.recepcion_id
      LEFT JOIN empresa e ON e.id = r.empresa_id
      WHERE c.fecha_salida IS NULL
      GROUP BY p.id, p.codigo_pallet
      ORDER BY p.id DESC
    `)

    const rows = (q as any).rows || []
    const pallets = rows.map((r: any) => ({
      id: Number(r.id),
      numero: r.codigo_pallet as string,
      empresa: (r.empresa || 'N/I') as string
    }))

    return res.status(200).json({ ok: true, pallets })
  } catch (e) {
    console.error('salidas/pallets error:', e)
    return res.status(500).json({ ok: false })
  }
}
