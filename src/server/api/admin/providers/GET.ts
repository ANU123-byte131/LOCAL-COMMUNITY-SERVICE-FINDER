import type { Request, Response } from 'express';
import db from '../../../../lib/db.js';

function checkAuth(req: Request): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  const expected = 'Basic ' + Buffer.from('admin:admin123').toString('base64');
  return auth === expected;
}

export default function handler(req: Request, res: Response) {
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const providers = db.prepare('SELECT * FROM providers ORDER BY created_at DESC').all();
    const stats = {
      total: (db.prepare('SELECT COUNT(*) as c FROM providers').get() as any).c,
      categories: (db.prepare('SELECT COUNT(DISTINCT category) as c FROM providers').get() as any).c,
      avgRating: Math.round(((db.prepare('SELECT AVG(rating) as r FROM providers').get() as any).r || 0) * 10) / 10,
    };
    res.json({ providers, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers', message: String(error) });
  }
}
