import { db } from '@/lib/db'
import { recepcion_fruta, usuarios, empresa, agricultores, tipos_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm' 
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler( req: NextApiRequest,  res: NextApiResponse): Promise<void> {

    const notas = await db.select({
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

  res.status(200).json({ notas })
}
