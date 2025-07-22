import { db } from '@/lib/db'
import { recepcion_fruta } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Método no permitido" });

  const { id, agricultor_id, tipo_fruta_id, cantidad_cajas, peso_caja_oz, empaque_id, notas, usuario_recepcion_id } = req.body;

  if (!id) return res.status(400).json({ success: false, message: "Falta id" });

  try {
    await db.update(recepcion_fruta)
      .set({
        agricultor_id: agricultor_id ? Number(agricultor_id) : undefined,
        tipo_fruta_id: tipo_fruta_id ? Number(tipo_fruta_id) : undefined,
        cantidad_cajas: cantidad_cajas ? Number(cantidad_cajas) : undefined,
        peso_caja_oz: peso_caja_oz ? String(peso_caja_oz) : undefined, 
        empaque_id: empaque_id ? Number(empaque_id) : undefined,
        notas,
        usuario_recepcion_id: usuario_recepcion_id ? Number(usuario_recepcion_id) : undefined,
      })
      .where(eq(recepcion_fruta.id, Number(id)));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al actualizar la nota" });
  }
}
