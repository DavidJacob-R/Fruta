import { db } from '@/lib/db'
import {
  recepcion_fruta,
  usuarios,
  empresa,
  agricultores,
  tipos_fruta,
  notas,
  empaques
} from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const supabasePublicUrl = 'https://ixpqujitjunnijdyrxyy.supabase.co/storage/v1/object/public/elmolinito/recepciones/'

    const recepciones = await db
      .select({
        id: recepcion_fruta.id,
        numero_nota: recepcion_fruta.numero_nota,
        tipo_nota: recepcion_fruta.tipo_nota,
        fecha_recepcion: recepcion_fruta.fecha_recepcion,
        empresa_nombre: empresa.empresa,
        empresa_email: empresa.email,
        empresa_telefono: empresa.telefono,
        agricultor_nombre: agricultores.nombre,
        agricultor_apellido: agricultores.apellido,
        agricultor_email: agricultores.email,
        agricultor_telefono: agricultores.telefono,
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
      .leftJoin(agricultores, eq(agricultores.id, recepcion_fruta.agricultor_id))
      .leftJoin(usuarios, eq(usuarios.id, recepcion_fruta.usuario_recepcion_id))
      .leftJoin(tipos_fruta, eq(tipos_fruta.id, recepcion_fruta.tipo_fruta_id))

    let empaquesMap: Record<string, string> = {}
    try {
      const empaquesList = await db.select().from(empaques)
      empaquesMap = Object.fromEntries(empaquesList.map((e: any) => [String(e.id), e.tamanio]))
    } catch {}

    // Aquí obtenemos todas las notas de la base
    const notasAll = await db.select().from(notas)

    const agrupado: Record<number, any> = {}

    for (const r of recepciones) {
      if (r.numero_nota === null) continue
      const key = r.numero_nota

      if (!agrupado[key]) {
        // Buscar la nota de recepcion y de calidad REAL para esa recepcion
        const notaRecepcion = notasAll.find(n => n.relacion_id === r.id && n.modulo === 'recepcion')
        const notaCalidad = notasAll.find(n => n.relacion_id === r.id && n.modulo === 'calidad')
        agrupado[key] = {
          numero_nota: r.numero_nota,
          tipo_nota: r.tipo_nota,
          fecha_recepcion: r.fecha_recepcion,
          empresa_nombre: r.empresa_nombre,
          empresa_email: r.empresa_email,
          empresa_telefono: r.empresa_telefono,
          agricultor_nombre: r.agricultor_nombre,
          agricultor_apellido: r.agricultor_apellido,
          agricultor_email: r.agricultor_email,
          agricultor_telefono: r.agricultor_telefono,
          usuario_nombre: r.usuario_nombre,
          usuario_apellido: r.usuario_apellido,
          usuario_email: r.usuario_email,
          frutas: [],
          // Solo aparecen los botones si SÍ existe la nota real:
          nota_recepcion_id: notaRecepcion ? notaRecepcion.id : null,
          nota_recepcion_titulo: notaRecepcion ? notaRecepcion.titulo : null,
          nota_calidad_id: notaCalidad ? notaCalidad.id : null,
          nota_calidad_titulo: notaCalidad ? notaCalidad.titulo : null,
          pdf_url: null,
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
        notas: r.notas,
      })
    }

    const ordenadas = Object.values(agrupado).sort((a, b) => {
      return new Date(b.fecha_recepcion).getTime() - new Date(a.fecha_recepcion).getTime()
    })

    res.status(200).json({ notas: ordenadas })
  } catch (error) {
    console.error('Error en /api/notas/listar:', error)
    res.status(500).json({ notas: [], error: error instanceof Error ? error.message : 'Error desconocido' })
  }
}
