import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  const {
    codigo_caja,
    agricultor_id,
    tipo_fruta_id,
    cantidad_cajas,
    peso_caja_oz,
    fecha_recepcion,
    usuario_recepcion_id,
    notas,
  } = req.body

  try {
    const sql = `
      INSERT INTO recepcion_fruta 
      (codigo_caja, agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, fecha_recepcion, usuario_recepcion_id, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    const values = [
      codigo_caja,
      agricultor_id,
      tipo_fruta_id,
      cantidad_cajas,
      peso_caja_oz,
      fecha_recepcion,
      usuario_recepcion_id,
      notas || null,
    ]

    await db.query(sql, values)

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('Error al registrar recepción:', error)
    res.status(500).json({ success: false, message: error.message || 'Error en el servidor' })
  }
}
