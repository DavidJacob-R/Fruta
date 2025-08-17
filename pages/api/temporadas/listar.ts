import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { temporadas } from "@/lib/schema";
import { desc } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const rows = await db
      .select()
      .from(temporadas)
      .orderBy(desc(temporadas.activa), desc(temporadas.fecha_inicio), desc(temporadas.id));
    const data = rows.map((r: any) => ({
      id: r.id,
      titulo: r.nombre,
      fecha_inicio: r.fecha_inicio,
      fecha_fin: r.fecha_fin,
      activa: r.activa,
    }));
    res.status(200).json({ temporadas: data });
  } catch {
    res.status(500).json({ error: "No se pudo listar las temporadas." });
  }
}
