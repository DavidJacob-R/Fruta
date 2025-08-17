import { db } from '@/lib/db'
import {
  recepcion_fruta,
  usuarios,
  empresa,
  tipos_fruta,
  notas,
  empaques as empaquesTable
} from '@/lib/schema'
import { eq, inArray } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const recepciones = await db
      .select({
        id: recepcion_fruta.id,
        numero_nota: recepcion_fruta.numero_nota,
        fecha_recepcion: recepcion_fruta.fecha_recepcion,
        empresa_nombre: empresa.empresa,
        empresa_email: empresa.email,
        empresa_telefono: empresa.telefono,
        fruta_nombre: tipos_fruta.nombre,
        usuario_nombre: usuarios.nombre,
        usuario_apellido: usuarios.apellido,
        usuario_email: usuarios.email,
        cantidad_cajas: recepcion_fruta.cantidad_cajas,
        peso_caja_oz: recepcion_fruta.peso_caja_oz,
        empaque_id: recepcion_fruta.empaque_id,
        sector: recepcion_fruta.sector,
        marca: recepcion_fruta.marca,
        destino: recepcion_fruta.destino,
        tipo_produccion: recepcion_fruta.tipo_produccion,
        variedad: recepcion_fruta.variedad,
        notas: recepcion_fruta.notas,
      })
      .from(recepcion_fruta)
      .leftJoin(empresa, eq(empresa.id, recepcion_fruta.empresa_id))
      .leftJoin(usuarios, eq(usuarios.id, recepcion_fruta.usuario_recepcion_id))
      .leftJoin(tipos_fruta, eq(tipos_fruta.id, recepcion_fruta.tipo_fruta_id))

    const empaquesList = await db.select().from(empaquesTable)
    const empaquesMap: Record<string, string> =
      Object.fromEntries(empaquesList.map((e: any) => [String(e.id), e.tamanio]))

    const ids = recepciones.map(r => r.id).filter(Boolean) as number[]
    const notasAll = ids.length
      ? await db.select().from(notas).where(inArray(notas.relacion_id, ids))
      : []

    const agrupado: Record<number, any> = {}

    for (const r of recepciones) {
      if (r.numero_nota === null) continue
      const key = r.numero_nota as number

      if (!agrupado[key]) {
        const notaRecepcion = notasAll.find(n => n.relacion_id === r.id && n.modulo === 'recepcion')
        const notaCalidad  = notasAll.find(n => n.relacion_id === r.id && n.modulo === 'calidad')

        agrupado[key] = {
          numero_nota: r.numero_nota,
          fecha_recepcion: r.fecha_recepcion,
          empresa_nombre: r.empresa_nombre,
          empresa_email: r.empresa_email,
          empresa_telefono: r.empresa_telefono,
          usuario_nombre: r.usuario_nombre,
          usuario_apellido: r.usuario_apellido,
          usuario_email: r.usuario_email,
          frutas: [],
          nota_recepcion_id: notaRecepcion ? notaRecepcion.id : null,
          nota_recepcion_titulo: notaRecepcion ? notaRecepcion.titulo : null,
          nota_calidad_id: notaCalidad ? notaCalidad.id : null,
          nota_calidad_titulo: notaCalidad ? notaCalidad.titulo : null,
          pdf_url: null
        }
      }

      agrupado[key].frutas.push({
        fruta_nombre: r.fruta_nombre,
        cantidad_cajas: r.cantidad_cajas,
        peso_caja_oz: r.peso_caja_oz,
        empaque_nombre: r.empaque_id ? (empaquesMap[String(r.empaque_id)] || '') : '',
        sector: r.sector,
        marca: r.marca,
        destino: r.destino,
        tipo_produccion: r.tipo_produccion,
        variedad: r.variedad,
        notas: r.notas
      })
    }

    const ordenadas = Object.values(agrupado).sort((a: any, b: any) => b.numero_nota - a.numero_nota)
    res.status(200).json({ notas: ordenadas })
  } catch (error) {
    console.error('Error en /api/notas/listar:', error)
    res.status(500).json({ notas: [], error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
