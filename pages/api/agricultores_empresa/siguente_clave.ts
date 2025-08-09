import { desc } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { agricultores_empresa } from "@/lib/schema";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  const nuevaClave = "AG" + String(siguiente).padStart(4, "0");

  res.status(200).json({ clave: nuevaClave });
}
