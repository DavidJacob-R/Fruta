import { desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { agricultores_empresa } from "@/lib/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).json({ success: false, message: "Método no permitido" });
    return;
  }

  const { nombre, hectareas, sectores, rfc, ubicacion, empresa_id } = req.body;

  if (!nombre || !empresa_id) {
    res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
    return;
  }

  const result = await db
    .select({ clave: agricultores_empresa.clave })
    .from(agricultores_empresa)
    .orderBy(desc(agricultores_empresa.clave))
    .limit(1);

  let siguiente = 1;
  if (result.length > 0 && typeof result[0].clave === "string") {
    const num = parseInt(result[0].clave.replace("AG", ""));
    if (!isNaN(num)) siguiente = num + 1;
  }
  const clave = "AG" + String(siguiente).padStart(4, "0");

  try {
    await db.insert(agricultores_empresa).values({
      clave,
      nombre,
      hectareas,
      sectores,
      rfc,
      ubicacion,
      empresa_id: Number(empresa_id),
    });
    res.status(200).json({ success: true, clave });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Error al agregar agricultor" });
  }
}
