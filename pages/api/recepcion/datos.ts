import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db'
import { agricultores, tipos_fruta } from '../../../lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const ags = await db.select().from(agricultores)
    const frs = await db.select().from(tipos_fruta)
    res.status(200).json({ agricultores: ags, frutas: frs })
  } catch (error) {
    res.status(500).json({ agricultores: [], frutas: [], error: 'Error al obtener datos' })
  }
}
