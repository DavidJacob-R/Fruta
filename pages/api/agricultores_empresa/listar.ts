import { eq } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { agricultores_empresa } from "@/lib/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { empresa_id } = req.query;

  if (!empresa_id) {
    res.status(400).json({ success: false, message: "Falta empresa_id" });
    return;
  }

  try {
    const agricultores = await db
      .select()
      .from(agricultores_empresa)
      .where(eq(agricultores_empresa.empresa_id, Number(empresa_id)));

    res.status(200).json({ success: true, agricultores });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al listar agricultores" });
  }
}
