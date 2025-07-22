import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '@/lib/db'
import { notas } from '@/lib/schema'
import { eq } from 'drizzle-orm'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, message: 'Método no permitido' })

  const { id, titulo, contenido, empresa_id, agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, empaque_id } = req.body

  if (!id || typeof contenido !== 'string') {
    return res.status(400).json({ success: false, message: 'Datos inválidos' })
  }

  let updateObj: any = {
    contenido,
    ...(titulo && { titulo }),
    ...(typeof empresa_id !== 'undefined' ? { empresa_id: empresa_id === '' ? null : Number(empresa_id) } : {}),
    ...(typeof agricultor_id !== 'undefined' ? { agricultor_id: agricultor_id === '' ? null : Number(agricultor_id) } : {}),
    ...(typeof tipo_fruta_id !== 'undefined' ? { tipo_fruta_id: tipo_fruta_id === '' ? null : Number(tipo_fruta_id) } : {}),
    ...(typeof cantidad_cajas !== 'undefined' ? { cantidad_cajas: cantidad_cajas === '' ? null : Number(cantidad_cajas) } : {}),
    ...(typeof peso_caja_oz !== 'undefined' ? { peso_caja_oz: peso_caja_oz === '' ? null : Number(peso_caja_oz) } : {}),
    ...(typeof empaque_id !== 'undefined' ? { empaque_id: empaque_id === '' ? null : Number(empaque_id) } : {}),
  }

  try {
    await db
      .update(notas)
      .set(updateObj)
      .where(eq(notas.id, Number(id)))

    res.status(200).json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al editar la nota' })
  }
}
