import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { empresa } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const empresas = await db
      .select({
        id: empresa.id,
        empresa: empresa.empresa,           
        telefono: empresa.telefono,
        email: empresa.email,
        direccion: empresa.direccion,
        tipo_venta: empresa.tipo_venta
      })
      .from(empresa)
      .where(eq(empresa.activo, true))
    res.status(200).json({ empresas })
  } catch (error) {
    res.status(500).json({ empresas: [], error: 'Error al listar empresas' })
  }
}
