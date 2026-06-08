import { Router } from 'express';
import { pool } from '../db';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const ALLOWED_TABLES = new Set([
  'products', 'stock_history', 'warehouses', 'vendors', 'purchases', 'orders',
  'deliveries', 'transfers', 'returns', 'requirements', 'promotions',
  'notifications', 'notification_settings', 'alert_rules', 'push_subscriptions',
  'webhook_configs', 'activity_log', 'daily_revenue', 'monthly_snapshots',
  'top_products', 'category_breakdown', 'return_reasons', 'vendor_performance',
  'warehouse_performance', 'notification_analytics', 'profiles',
  'categories', 'sub_categories',
]);

const OPS: Record<string, string> = {
  eq: '=', neq: '!=', gte: '>=', lte: '<=', gt: '>', lt: '<',
  like: 'LIKE', ilike: 'ILIKE',
};
const RESERVED = new Set(['select', 'order', 'limit', 'offset', 'single', 'maybeSingle', 'onConflict']);

function parseOrFilter(orStr: string, startAt: number): { condition: string; values: unknown[] } {
  const parts = orStr.split(',');
  const orConds: string[] = [];
  const orVals: unknown[] = [];
  let idx = startAt;
  for (const part of parts) {
    const firstDot = part.indexOf('.');
    if (firstDot === -1) continue;
    const col = part.slice(0, firstDot);
    const rest = part.slice(firstDot + 1);
    const secondDot = rest.indexOf('.');
    if (secondDot === -1) continue;
    const op = rest.slice(0, secondDot);
    const val = rest.slice(secondDot + 1);
    if (!OPS[op]) continue;
    orConds.push(`"${col}" ${OPS[op]} $${idx++}`);
    orVals.push(val);
  }
  return { condition: orConds.length ? `(${orConds.join(' OR ')})` : '1=1', values: orVals };
}

function parseFilters(query: Record<string, string>, startAt = 1) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let i = startAt;
  for (const [key, raw] of Object.entries(query)) {
    if (RESERVED.has(key)) continue;
    if (key === '__or__') {
      const { condition, values: orVals } = parseOrFilter(raw, i);
      if (orVals.length > 0) {
        conditions.push(condition);
        values.push(...orVals);
        i += orVals.length;
      }
      continue;
    }
    const m = /^(eq|neq|gte|lte|gt|lt|like|ilike)\.(.+)$/.exec(raw);
    if (!m) continue;
    const [, op, val] = m;
    conditions.push(`"${key}" ${OPS[op]} $${i++}`);
    values.push(val === 'true' ? true : val === 'false' ? false : val);
  }
  return { conditions, values };
}

function safeCols(cols: string) {
  if (cols === '*') return '*';
  return cols.split(',').map(c => {
    const t = c.trim();
    if (t === '*') return t;
    // Support Supabase alias syntax: "alias:column" → "column" AS "alias"
    const colonIdx = t.indexOf(':');
    if (colonIdx !== -1) {
      const alias = t.slice(0, colonIdx).trim();
      const col   = t.slice(colonIdx + 1).trim();
      return `"${col}" AS "${alias}"`;
    }
    return `"${t}"`;
  }).join(', ');
}

// GET /api/:table
router.get('/:table', optionalAuth, async (req: AuthRequest, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ data: null, error: 'Unknown table' });

  const q = req.query as Record<string, string>;
  const { conditions, values } = parseFilters(q);

  let sql = `SELECT ${safeCols(q.select || '*')} FROM "${table}"`;
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  if (q.order) {
    const [col, dir] = q.order.split('.');
    sql += ` ORDER BY "${col}" ${dir === 'desc' ? 'DESC' : 'ASC'}`;
  }
  if (q.limit) sql += ` LIMIT ${Math.abs(parseInt(q.limit, 10))}`;

  try {
    const result = await pool.query(sql, values);
    if (q.single === 'true') {
      if (!result.rows[0]) return res.status(406).json({ data: null, error: 'No rows found' });
      return res.json({ data: result.rows[0], error: null });
    }
    if (q.maybeSingle === 'true') {
      return res.json({ data: result.rows[0] ?? null, error: null });
    }
    res.json({ data: result.rows, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /api/:table  (insert or upsert)
router.post('/:table', authenticate, async (req: AuthRequest, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ data: null, error: 'Unknown table' });

  const onConflict = (req.query.onConflict as string) || null;
  const rows = Array.isArray(req.body) ? req.body : [req.body];

  try {
    const inserted: unknown[] = [];
    for (const row of rows) {
      const keys = Object.keys(row);
      if (!keys.length) continue;
      const vals = keys.map(k => {
        const v = row[k];
        return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
      });
      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

      let sql = `INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`;
      if (onConflict) {
        const updateCols = keys.filter(k => k !== onConflict);
        if (updateCols.length) {
          sql += ` ON CONFLICT ("${onConflict}") DO UPDATE SET ${updateCols.map(k => `"${k}" = EXCLUDED."${k}"`).join(', ')}`;
        } else {
          sql += ` ON CONFLICT ("${onConflict}") DO NOTHING`;
        }
      } else {
        sql += ` ON CONFLICT DO NOTHING`;
      }
      sql += ' RETURNING *';

      const r = await pool.query(sql, vals);
      inserted.push(r.rows[0] ?? null);
    }
    res.json({ data: rows.length === 1 ? inserted[0] : inserted, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// PATCH /api/:table  (update)
router.patch('/:table', authenticate, async (req: AuthRequest, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ data: null, error: 'Unknown table' });

  const q = req.query as Record<string, string>;
  const body = req.body;
  const keys = Object.keys(body);
  if (!keys.length) return res.status(400).json({ data: null, error: 'No update fields provided' });

  const vals: unknown[] = keys.map(k => {
    const v = body[k];
    return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
  });
  const setClauses = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

  const { conditions, values: filterVals } = parseFilters(q, keys.length + 1);

  let sql = `UPDATE "${table}" SET ${setClauses}`;
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' RETURNING *';

  try {
    const result = await pool.query(sql, [...vals, ...filterVals]);
    res.json({ data: result.rows, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /api/:table
router.delete('/:table', authenticate, async (req: AuthRequest, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) return res.status(400).json({ data: null, error: 'Unknown table' });

  const q = req.query as Record<string, string>;
  const { conditions, values } = parseFilters(q);

  let sql = `DELETE FROM "${table}"`;
  if (conditions.length) sql += ` WHERE ${conditions.join(' AND ')}`;
  sql += ' RETURNING *';

  try {
    const result = await pool.query(sql, values);
    res.json({ data: result.rows, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

export default router;
