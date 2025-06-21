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
    notas,
  } = req.body

  if (!codigo_caja) {
    return res.status(400).json({ success: false, message: 'Código de caja faltante' })
  }

  try {
    await db.query(
      `UPDATE recepcion_fruta SET 
        agricultor_id = ?, 
        tipo_fruta_id = ?, 
        cantidad_cajas = ?, 
        peso_caja_oz = ?, 
        notas = ? 
      WHERE codigo_caja = ?`,
      [agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, notas, codigo_caja]
    )
    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al editar el registro' })
  }
}
