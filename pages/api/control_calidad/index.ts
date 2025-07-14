
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db"; // ajusta a tu path real
import { recepcion_fruta, empresa, agricultores, tipos_fruta, empaques, control_calidad, motivos_rechazo } from "../../../lib/schema";
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {

    const pedidos = await db.execute(
      `
      SELECT r.*, 
        e.empresa AS empresa_nombre, 
        a.nombre AS agricultor_nombre, 
        a.apellido AS agricultor_apellido,
        tf.nombre AS fruta_nombre, 
        em.tamanio AS empaque_nombre
      FROM recepcion_fruta r
      LEFT JOIN empresa e ON r.empresa_id = e.id
      LEFT JOIN agricultores a ON r.agricultor_id = a.id
      LEFT JOIN tipos_fruta tf ON r.tipo_fruta_id = tf.id
      LEFT JOIN empaques em ON r.empaque_id = em.id
      WHERE r.id NOT IN (SELECT recepcion_id FROM control_calidad)
      ORDER BY r.fecha_recepcion DESC
      `
    );

const motivos = await db.select().from(motivos_rechazo).where(eq(motivos_rechazo.activo, true));

    res.status(200).json({
      pedidos,
      motivos
    });
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
