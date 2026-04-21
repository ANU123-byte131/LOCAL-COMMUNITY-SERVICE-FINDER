import type { Request, Response } from 'express';
import db from '../../../../lib/db.js';

function checkAuth(req: Request): boolean {
  const auth = req.headers.authorization;
  if (!auth) return false;
  return auth === 'Basic ' + Buffer.from('admin:admin123').toString('base64');
}

export default function handler(req: Request, res: Response) {
  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const { name, category, description, phone, email, address, city, state, zip, lat, lng, rating, review_count, availability, years_experience, hourly_rate, languages } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category are required' });

    const result = db.prepare(`
      INSERT INTO providers (name, category, description, phone, email, address, city, state, zip, lat, lng, rating, review_count, availability, years_experience, hourly_rate, languages)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category, description, phone, email, address, city, state, zip, lat || null, lng || null, rating || 0, review_count || 0, availability || 'available', years_experience || null, hourly_rate, languages);

    const provider = db.prepare('SELECT * FROM providers WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ provider });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create provider', message: String(error) });
  }
}
