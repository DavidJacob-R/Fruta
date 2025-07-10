import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { agricultores } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await db
      .select({
        id: agricultores.id,
        nombre: agricultores.nombre,
        apellido: agricultores.apellido,
        empresa: agricultores.empresa,
        telefono: agricultores.telefono,
        email: agricultores.email,
        direccion: agricultores.direccion,
        tipo_venta: agricultores.tipo_venta
      })
      .from(agricultores)
      .where(eq(agricultores.activo, true))
    res.status(200).json({ agricultores: result })
  } catch (error) {
    res.status(500).json({ agricultores: [], error: 'Error al listar agricultores' })
  }
}
