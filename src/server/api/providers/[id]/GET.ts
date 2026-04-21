import type { Request, Response } from 'express';
import db from '../../../../lib/db.js';

export default function handler(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const provider = db.prepare('SELECT * FROM providers WHERE id = ?').get(id);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });

    // Get related providers (same category, different id)
    const related = db
      .prepare('SELECT * FROM providers WHERE category = ? AND id != ? ORDER BY rating DESC LIMIT 3')
      .all((provider as any).category, id);

    res.json({ provider, related });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch provider', message: String(error) });
  }
}
