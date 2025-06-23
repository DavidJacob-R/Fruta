import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { desde } = req.query

    let filtroFecha = '1970-01-01T00:00:00'
    if (typeof desde === 'string') filtroFecha = desde

    // Consulta SQL filtrando desde esa fecha
    const [rows]: any = await db.query(`
      SELECT 
        r.codigo_caja,
        r.agricultor_id,
        r.tipo_fruta_id,
        r.cantidad_cajas,
        r.peso_caja_oz,
        r.fecha_recepcion,
        r.notas,
        a.nombre AS agricultor,
        f.nombre AS fruta
      FROM recepcion_fruta r
      JOIN agricultores a ON r.agricultor_id = a.id
      JOIN tipos_fruta f ON r.tipo_fruta_id = f.id
      WHERE r.fecha_recepcion >= ?
      ORDER BY r.fecha_recepcion DESC
    `, [filtroFecha])

    res.status(200).json({ recepciones: rows })
  } catch (error) {
    console.error('Error al obtener recepciones:', error)
    res.status(500).json({ success: false, message: 'Error en el servidor' })
  }
}
