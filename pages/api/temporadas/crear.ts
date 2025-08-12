import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { temporadas } from '@/lib/schema';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'metodo' });
    return;
  }

  try {
    const { titulo, fecha_inicio, fecha_fin } = req.body || {};

    if (!titulo || !fecha_inicio || !fecha_fin) {
      res.status(400).json({ error: 'datos' });
      return;
    }

    await db.insert(temporadas).values({
      titulo,
      fecha_inicio,
      fecha_fin,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'error' });
  }
}
