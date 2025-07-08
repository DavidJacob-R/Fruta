// pages/api/empaques/listar.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { tipos_clamshell } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const empaques = await db.select().from(tipos_clamshell).where(eq(tipos_clamshell.activo, true))
    res.status(200).json({ empaques })
  } catch (error) {
    res.status(500).json({ empaques: [], error: 'Error al listar empaques' })
  }
}
