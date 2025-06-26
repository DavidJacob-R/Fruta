import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'
import { and, gte, lte } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const now = new Date()

    const year = now.getFullYear()
    const month = now.getMonth() 
    const day = now.getDate()

    // Fecha inicio del día (00:00:00)
    const startOfDay = new Date(year, month, day, 0, 0, 0, 0)
    // Fecha fin del día (23:59:59)
    const endOfDay = new Date(year, month, day, 23, 59, 59, 999)

    const result = await db
      .select()
      .from(recepcion_fruta)
      .where(
        and(
          gte(recepcion_fruta.fecha_recepcion, startOfDay),
          lte(recepcion_fruta.fecha_recepcion, endOfDay)
        )
      )
    res.status(200).json({ recepciones: result }) 
  } catch (error) {
    res.status(500).json({ recepciones: [], error: 'Error al obtener recepciones' })
  }
}
