import type { Request, Response } from 'express';
import db from '../../../../../lib/db.js';

function checkAuth(req: Request): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  return auth === 'Basic ' + Buffer.from('admin:admin123').toString('base64');
}

export default function handler(req: Request, res: Response) {
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM providers WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete provider', message: String(error) });
  }
}
