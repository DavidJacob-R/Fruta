import { agricultores_empresa, empresa, recepcion_fruta, tipos_clamshell, tipos_fruta } from '@/lib/schema'
import { db } from '@/lib/db'
import { and, gte, lt, eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { desde } = req.query

    let start: Date | null = null
    let end: Date | null = null
    if (desde) {
      const d = new Date(desde as string)
      d.setHours(0, 0, 0, 0)
      start = d
      end = new Date(d)
      end.setDate(d.getDate() + 1)
    }

    const base = db
      .select({
        numero_nota: recepcion_fruta.numero_nota,
        fecha_recepcion: recepcion_fruta.fecha_recepcion,
        notas: recepcion_fruta.notas,
        empresa_nombre: empresa.empresa,
        agricultor_nombre: agricultores_empresa.nombre, // <- ahora desde agricultores_empresa
        fruta_nombre: tipos_fruta.nombre,
        empaque_nombre: tipos_clamshell.tamanio,
        peso_caja_oz: recepcion_fruta.peso_caja_oz
      })
      .from(recepcion_fruta)
      .leftJoin(agricultores_empresa, eq(recepcion_fruta.agricultor_id, agricultores_empresa.id))
      .leftJoin(empresa, eq(recepcion_fruta.empresa_id, empresa.id))
      .leftJoin(tipos_fruta, eq(recepcion_fruta.tipo_fruta_id, tipos_fruta.id))
      .leftJoin(tipos_clamshell, eq(recepcion_fruta.empaque_id, tipos_clamshell.id))

    const rows = await (start && end
      ? base.where(and(gte(recepcion_fruta.fecha_recepcion, start), lt(recepcion_fruta.fecha_recepcion, end)))
      : base)

    const agrupado = Object.values(
      rows.reduce((acc, item) => {
        if (item.numero_nota === null) return acc
        const key = item.numero_nota as number
        if (!acc[key]) {
          acc[key] = {
            numero_nota: item.numero_nota,
            fecha_recepcion: item.fecha_recepcion,
            empresa_nombre: item.empresa_nombre,
            agricultor_nombre: item.agricultor_nombre || null, // sin apellido en la nueva tabla
            frutas: []
          }
        }
        acc[key].frutas.push({
          fruta_nombre: item.fruta_nombre,
          empaque_nombre: item.empaque_nombre,
          peso_caja_oz: item.peso_caja_oz,
          notas: item.notas
        })
        return acc
      }, {} as Record<number, any>)
    )

    res.status(200).json({ recepciones: agrupado })
  } catch (error) {
    res.status(500).json({ recepciones: [], error: 'Error al obtener recepciones' })
  }
}
