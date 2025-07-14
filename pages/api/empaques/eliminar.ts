import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { empaques } from "@/lib/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el id" });
  }
  try {
    const idNum = Number(id);
    if (isNaN(idNum)) {
      return res.status(400).json({ success: false, message: "El id no es un número" });
    }
    await db.delete(empaques).where(eq(empaques.id, idNum));
    res.status(200).json({ success: true });
  } catch (error: any) {
    // Manejo del error por clave foránea
    if (
      error?.cause?.code === "23503" ||
      (error?.cause?.detail && error.cause.detail.toLowerCase().includes("referenced"))
    ) {
      return res.status(409).json({
        success: false,
        message: "No se puede eliminar este empaque porque está siendo usado en un pedido.",
      });
    }
    // Otros errores
    res.status(500).json({
      success: false,
      message: error.message || "Error al eliminar empaque",
    });
  }
}
