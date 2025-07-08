import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import {
  recepcion_fruta,
  agricultores,
  empresa,
  tipos_fruta,
  tipos_clamshell
} from '@/lib/schema'
import { and, gte, lte, eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { desde } = req.query

    let filtroFecha: any = undefined
    if (desde) {
      const start = new Date(desde as string)
      const end = new Date(start)
      end.setDate(start.getDate() + 1)
      filtroFecha = and(
        gte(recepcion_fruta.fecha_recepcion, start),
        lte(recepcion_fruta.fecha_recepcion, end)
      )
    }

    const result = await db
      .select({
        numero_nota: recepcion_fruta.numero_nota,
        tipo_nota: recepcion_fruta.tipo_nota,
        fecha_recepcion: recepcion_fruta.fecha_recepcion,
        notas: recepcion_fruta.notas,
        empresa_nombre: empresa.nombre,
        agricultor_nombre: agricultores.nombre,
        agricultor_apellido: agricultores.apellido,
        fruta_nombre: tipos_fruta.nombre,
        empaque_nombre: tipos_clamshell.tamanio,
        peso_caja_oz: recepcion_fruta.peso_caja_oz, 
      })
      .from(recepcion_fruta)
      .leftJoin(agricultores, eq(recepcion_fruta.agricultor_id, agricultores.id))
      .leftJoin(empresa, eq(recepcion_fruta.empresa_id, empresa.id))
      .leftJoin(tipos_fruta, eq(recepcion_fruta.tipo_fruta_id, tipos_fruta.id))
      .leftJoin(tipos_clamshell, eq(recepcion_fruta.empaque_id, tipos_clamshell.id))
      .where(filtroFecha ? filtroFecha : undefined)

    return res.status(200).json({ recepciones: result })
  } catch (error) {
    res.status(500).json({ recepciones: [], error: 'Error al obtener recepciones' })
  }
}
