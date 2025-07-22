import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas } from '@/lib/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const rows = await db.select().from(notas)
  res.status(200).json({
    cantidad: rows.length,
    ids: rows.map(n => n.id),
    primerNota: rows[0] || null,
    rows
  })
}
