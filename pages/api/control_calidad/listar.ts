import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const pedidos = await db.execute(sql`
      SELECT 
        r.*,
        e.empresa AS empresa_nombre,
        ae.nombre AS agricultor_nombre,
        tf.nombre AS fruta_nombre,
        em.tamanio AS empaque_nombre
      FROM public.recepcion_fruta r
      LEFT JOIN public.control_calidad c ON c.recepcion_id = r.id
      LEFT JOIN public.empresa e ON e.id = r.empresa_id
      LEFT JOIN public.agricultores_empresa ae ON ae.id = r.agricultor_id
      LEFT JOIN public.tipos_fruta tf ON tf.id = r.tipo_fruta_id
      LEFT JOIN public.empaques em ON em.id = r.empaque_id
      WHERE c.id IS NULL
      ORDER BY r.creado_en DESC
      LIMIT 50;
    `)

    res.status(200).json({ pedidos: (pedidos as any).rows ?? pedidos })
  } catch (err: unknown) {
    let message = 'Error desconocido'
    if (err instanceof Error) message = err.message
    res.status(500).json({ error: 'Error listando pedidos pendientes', details: message })
  }
}
