import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { temporadas } from "@/lib/schema";
import { and, gte, lte, ne, eq } from "drizzle-orm";

type ApiResp = { ok: true } | { ok: false; code: string; message: string; conflicto?: { id: number; nombre: string | null; fecha_inicio: string | null; fecha_fin: string | null } };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResp>) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ ok: false, code: "id", message: "Id inválido" });
    return;
  }
  if (req.method !== "PUT") {
    res.status(405).json({ ok: false, code: "metodo", message: "Método no permitido" });
    return;
  }

  try {
    const { titulo, fecha_inicio, fecha_fin } = req.body || {};
    if (!titulo || !fecha_inicio || !fecha_fin) {
      res.status(400).json({ ok: false, code: "datos", message: "Completa todos los campos" });
      return;
    }

    const fi = String(fecha_inicio).slice(0, 10);
    const ff = String(fecha_fin).slice(0, 10);
    if (ff < fi) {
      res.status(400).json({ ok: false, code: "rango_invalido", message: "La fecha fin no puede ser menor a la fecha inicio" });
      return;
    }

    const idNum = Number(id);

    // Comprobar que exista
    const existe = await db.select({ id: temporadas.id }).from(temporadas).where(eq(temporadas.id, idNum)).limit(1);
    if (existe.length === 0) {
      res.status(404).json({ ok: false, code: "no_encontrada", message: "La temporada no existe." });
      return;
    }

    // Validar solape
    const solape = await db
      .select({
        id: temporadas.id,
        nombre: temporadas.nombre,
        fecha_inicio: temporadas.fecha_inicio,
        fecha_fin: temporadas.fecha_fin,
      })
      .from(temporadas)
      .where(and(lte(temporadas.fecha_inicio, ff as any), gte(temporadas.fecha_fin, fi as any), ne(temporadas.id, idNum)))
      .limit(1);

    if (solape.length > 0) {
      const c = solape[0];
      res.status(409).json({
        ok: false,
        code: "fechas_empalmadas",
        message: `Las fechas se empalman con "${c.nombre}" (${c.fecha_inicio} a ${c.fecha_fin}).`,
        conflicto: { id: c.id, nombre: c.nombre, fecha_inicio: String(c.fecha_inicio), fecha_fin: String(c.fecha_fin) },
      });
      return;
    }

    await db.update(temporadas).set({ nombre: String(titulo), fecha_inicio: fi, fecha_fin: ff }).where(eq(temporadas.id, idNum));

    res.status(200).json({ ok: true });
  } catch (e: any) {
    const pgCode = e?.code ? String(e.code) : "";
    if (pgCode === "23P01") {
      res.status(409).json({ ok: false, code: "fechas_empalmadas", message: "Las fechas se empalman con otra temporada." });
      return;
    }
    if (pgCode === "23514") {
      res.status(400).json({ ok: false, code: "rango_invalido", message: "Rango de fechas inválido." });
      return;
    }
    res.status(500).json({ ok: false, code: "error", message: "No se pudo editar la temporada." });
  }
}
