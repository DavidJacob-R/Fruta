import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { agricultores, empresa, tipos_fruta } from '@/lib/schema'
import { and, isNotNull, ne, eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Agricultores activos
    const agricultoresList = await db
      .select({ id: agricultores.id, nombre: agricultores.nombre, apellido: agricultores.apellido })
      .from(agricultores)
      .where(
        and(
          isNotNull(agricultores.nombre),
          ne(agricultores.nombre, ''),
          eq(agricultores.activo, true)
        )
      )

    // Empresas activas
    const empresasList = await db
      .select({ id: empresa.id, nombre: empresa.nombre })
      .from(empresa)
      .where(
        and(
          isNotNull(empresa.nombre),
          ne(empresa.nombre, ''),
          eq(empresa.activo, true)
        )
      )

    // Tipos de fruta activas
    const frutas = await db
      .select()
      .from(tipos_fruta)
      .where(eq(tipos_fruta.activo, true))

    res.status(200).json({ agricultores: agricultoresList, empresas: empresasList, frutas })
  } catch (error) {
    res.status(500).json({ agricultores: [], empresas: [], frutas: [], error: 'Error en datos de recepción' })
  }
}
