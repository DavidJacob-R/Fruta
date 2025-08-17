import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { empresa, tipos_fruta } from '@/lib/schema' // ajusta los imports a tu schema real

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Empresas con la clave exacta que espera el front: "empresa"
    const empresasRows = await db
      .select({
        id: empresa.id,
        empresa: empresa.empresa, // <-- alias como "empresa"
      })
      .from(empresa)

    // Tipos de fruta
    const frutasRows = await db
      .select({
        id: tipos_fruta.id,
        nombre: tipos_fruta.nombre,
      })
      .from(tipos_fruta)

    res.status(200).json({
      success: true,
      empresas: empresasRows,
      frutas: frutasRows,
    })
  } catch (e) {
    res.status(500).json({ success: false, error: 'Error al obtener datos' })
  }
}
