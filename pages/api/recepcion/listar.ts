import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [rows]: any = await db.query(`
      SELECT 
        r.codigo_caja,
        r.cantidad_cajas,
        r.peso_caja_oz,
        r.fecha_recepcion,
        r.notas,
        a.nombre AS agricultor,
        f.nombre AS fruta
      FROM recepcion_fruta r
      JOIN agricultores a ON r.agricultor_id = a.id
      JOIN tipos_fruta f ON r.tipo_fruta_id = f.id
      ORDER BY r.fecha_recepcion DESC
    `)

    res.status(200).json({ recepciones: rows })
  } catch (error) {
    console.error('Error al obtener recepciones:', error)
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}
