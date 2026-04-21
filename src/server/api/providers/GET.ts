import type { Request, Response } from 'express';
import db from '../../../lib/db.js';

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function handler(req: Request, res: Response) {
  try {
    const {
      category,
      keyword,
      lat,
      lng,
      radius = '25',
      page = '1',
      limit = '10',
      minRating = '0',
      availability,
      sortBy = 'rating',
    } = req.query as Record<string, string>;

    let query = 'SELECT * FROM providers WHERE 1=1';
    const params: (string | number)[] = [];

    if (category) {
      const cats = category.split(',').map((c) => c.trim());
      query += ` AND category IN (${cats.map(() => '?').join(',')})`;
      params.push(...cats);
    }

    if (keyword) {
      query += ' AND (name LIKE ? OR description LIKE ? OR city LIKE ?)';
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    if (availability) {
      query += ' AND availability = ?';
      params.push(availability);
    }

    if (parseFloat(minRating) > 0) {
      query += ' AND rating >= ?';
      params.push(parseFloat(minRating));
    }

    const allProviders = db.prepare(query).all(...params) as any[];

    // Apply distance filter if lat/lng provided
    let filtered = allProviders;
    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);
    const radiusMiles = parseFloat(radius);

    if (!isNaN(userLat) && !isNaN(userLng)) {
      filtered = allProviders
        .map((p) => ({
          ...p,
          distance:
            p.lat && p.lng ? Math.round(haversineDistance(userLat, userLng, p.lat, p.lng) * 10) / 10 : null,
        }))
        .filter((p) => p.distance === null || p.distance <= radiusMiles);
    } else {
      filtered = allProviders.map((p) => ({ ...p, distance: null }));
    }

    // Sort
    if (sortBy === 'distance' && !isNaN(userLat)) {
      filtered.sort((a, b) => (a.distance ?? 999) - (b.distance ?? 999));
    } else if (sortBy === 'price') {
      filtered.sort((a, b) => {
        const aPrice = parseFloat((a.hourly_rate || '0').replace(/[^0-9.]/g, ''));
        const bPrice = parseFloat((b.hourly_rate || '0').replace(/[^0-9.]/g, ''));
        return aPrice - bPrice;
      });
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    const total = filtered.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(offset, offset + limitNum);

    res.json({
      providers: paginated,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch providers', message: String(error) });
  }
}
