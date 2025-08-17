import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { temporadas } from "@/lib/schema";
import { eq } from "drizzle-orm";

type ApiResp = { ok: true } | { ok: false; code: string; message: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ ok: false, code: "id", message: "Id inválido" });
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, code: "metodo", message: "Método no permitido" });
    return;
  }
  try {
    const idNum = Number(id);

    const existe = await db.select({ id: temporadas.id }).from(temporadas).where(eq(temporadas.id, idNum)).limit(1);
    if (existe.length === 0) {
      res.status(404).json({ ok: false, code: "no_encontrada", message: "La temporada no existe." });
      return;
    }

    await db.transaction(async (tx) => {
      await tx.update(temporadas).set({ activa: false });
      await tx.update(temporadas).set({ activa: true }).where(eq(temporadas.id, idNum));
    });
    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ ok: false, code: "error", message: "No se pudo activar la temporada." });
  }
}
