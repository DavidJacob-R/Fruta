import { db } from '@/lib/db'
import {
  recepcion_fruta,
  usuarios,
  empresa,
  agricultores,
  tipos_fruta,
  notas
} from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // 👇🏻 Agregamos el orderBy
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
    })
    .from(recepcion_fruta)
    .leftJoin(empresa, eq(empresa.id, recepcion_fruta.empresa_id))
    .leftJoin(agricultores, eq(agricultores.id, recepcion_fruta.agricultor_id))
    .leftJoin(usuarios, eq(usuarios.id, recepcion_fruta.usuario_recepcion_id))
    .leftJoin(tipos_fruta, eq(tipos_fruta.id, recepcion_fruta.tipo_fruta_id))
    .orderBy(desc(recepcion_fruta.numero_nota))

  const notasAll = (await db.select().from(notas)) as any[]

  const notasResult = recepciones.map(r => {
    const notaRecepcion = notasAll.find(n =>
      n.relacion_id === r.id && n.modulo === 'recepcion'
    )
    const notaCalidad = notasAll.find(n =>
      n.relacion_id === r.id && n.modulo === 'calidad'
    )
    return {
      ...r,
      nota_recepcion_id: notaRecepcion?.id || null,
      nota_recepcion_titulo: notaRecepcion?.titulo || null,
      nota_calidad_id: notaCalidad?.id || null,
      nota_calidad_titulo: notaCalidad?.titulo || null,
    }
  })

  res.status(200).json({ notas: notasResult })
}
