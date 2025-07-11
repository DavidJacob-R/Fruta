// pages/api/control_calidad/registrar.ts

import { NextApiRequest, NextApiResponse } from "next";
import { db } from "../../../lib/db";
import { control_calidad, control_calidad_motivos } from "../../../lib/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const {
      recepcion_id,
      usuario_control_id,
      cajas_aprobadas,
      cajas_rechazadas,
      notas,
      motivos // Array: [{ motivo_id, cantidad_cajas }]
    } = req.body;

    try {
      // Inserta control de calidad
      const result = await db.insert(control_calidad).values({
        recepcion_id,
        pasa_calidad: cajas_aprobadas > 0, // o como gustes definir la lógica
        usuario_control_id,
        fecha_control: new Date(),
        cajas_aprobadas,
        cajas_rechazadas,
        notas
      }).returning({ id: control_calidad.id });

      const controlId = result[0].id;

      // Si hay motivos de rechazo, guarda cada uno
      if (Array.isArray(motivos) && motivos.length > 0) {
        for (const m of motivos) {
          await db.insert(control_calidad_motivos).values({
            control_id: controlId,
            motivo_id: m.motivo_id,
            cantidad_cajas: m.cantidad_cajas
          });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as any).message });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}
