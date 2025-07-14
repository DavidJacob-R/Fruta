import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { empaques } from "@/lib/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }
  const { tamanio, descripcion } = req.body;
  if (!tamanio || !descripcion) {
    return res.status(400).json({ success: false, message: "Faltan datos" });
  }
  try {
    await db.insert(empaques).values({
      tamanio: String(tamanio),
      descripcion: String(descripcion),
    });
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al crear empaque" });
  }
}
