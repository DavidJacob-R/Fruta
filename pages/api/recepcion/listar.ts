import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await db.select().from(recepcion_fruta)
    res.status(200).json({ recepciones: result }) 
  } catch (error) {
    res.status(500).json({ recepciones: [], error: 'Error al obtener recepciones' })
  }
}
