import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const [agricultores]: any = await db.query('SELECT id, nombre, apellido FROM agricultores WHERE activo = TRUE')
    const [frutas]: any = await db.query('SELECT id, nombre FROM tipos_fruta WHERE activo = TRUE')

    res.status(200).json({ agricultores, frutas })
  } catch (error) {
    console.error('Error al obtener datos:', error)
    res.status(500).json({ success: false, message: 'Error al obtener datos' })
  }
}
