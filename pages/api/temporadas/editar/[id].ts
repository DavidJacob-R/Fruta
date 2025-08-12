import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { temporadas } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'id' });
    return;
  }

  if (req.method !== 'PUT') {
    res.status(405).json({ error: 'metodo' });
    return;
  }

  try {
    const { titulo, fecha_inicio, fecha_fin } = req.body || {};

    if (!titulo || !fecha_inicio || !fecha_fin) {
      res.status(400).json({ error: 'datos' });
      return;
    }

    await db.update(temporadas)
      .set({ titulo, fecha_inicio, fecha_fin })
      .where(eq(temporadas.id, Number(id)));

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'error' });
  }
}
