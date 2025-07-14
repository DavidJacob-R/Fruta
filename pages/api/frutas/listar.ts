import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { tipos_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const frutas = await db
      .select({ id: tipos_fruta.id, nombre: tipos_fruta.nombre, descripcion: tipos_fruta.descripcion })
      .from(tipos_fruta)
      .where(eq(tipos_fruta.activo, true))
    res.status(200).json({ frutas })
  } catch (error) {
    res.status(500).json({ frutas: [], error: 'Error al listar frutas' })
  }
}
