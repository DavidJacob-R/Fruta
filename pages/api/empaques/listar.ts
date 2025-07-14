import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { empaques } from "@/lib/schema";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Método no permitido" });
  }
  try {
    const results = await db.select().from(empaques);
    res.status(200).json({ empaques: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Error al listar empaques" });
  }
}
