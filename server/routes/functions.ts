import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Replaces the Supabase edge function: alert-rules-evaluator
router.post('/alert-rules-evaluator', async (_req, res) => {
  try {
    const [rulesResult, productsResult] = await Promise.all([
      pool.query('SELECT * FROM alert_rules WHERE is_active = true'),
      pool.query('SELECT * FROM products WHERE stock <= low_stock_threshold'),
    ]);

    const rules = rulesResult.rows;
    const lowStockProducts = productsResult.rows;
    let totalCreated = 0;

    for (const rule of rules) {
      if (rule.trigger_type !== 'stock_below_threshold') continue;

      for (const product of lowStockProducts) {
        const threshold = rule.trigger_condition?.threshold ?? product.low_stock_threshold;
        if (product.stock > threshold) continue;

        // Avoid duplicate notifications within the last hour
        const recent = await pool.query(
          `SELECT id FROM notifications
           WHERE data->>'product_id' = $1 AND type = $2
           AND created_at > NOW() - INTERVAL '1 hour' LIMIT 1`,
          [product.id, rule.notification_type]
        );
        if (recent.rows.length > 0) continue;

        const msg = rule.message_template
          .replace('{{product_name}}', product.name)
          .replace('{{stock}}', String(product.stock));

        const title = rule.notification_type === 'out_of_stock'
          ? `Out of Stock: ${product.name}`
          : `Low Stock: ${product.name}`;

        const admins = await pool.query("SELECT id FROM profiles WHERE role = 'admin'");
        for (const admin of admins.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)`,
            [admin.id, rule.notification_type, title, msg,
              JSON.stringify({ product_id: product.id, product_name: product.name, stock: product.stock })]
          );
          totalCreated++;
        }
      }
    }

    res.json({ total_created: totalCreated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /functions/v1/invite-user  (admin only)
router.post('/invite-user', authenticate, async (req: AuthRequest, res) => {
  const { email, full_name = 'User', role = 'staff', phone, password } = req.body;

  if (!email) return res.status(400).json({ success: false, error: 'Email is required' });
  if (!['admin', 'staff', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'A user with this email already exists' });
    }

    const plainPassword = password || Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const seq = String(Number(countResult.rows[0].count) + 1).padStart(3, '0');
    const userId = `USR-${seq}`;

    await pool.query('BEGIN');
    await pool.query('INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)', [userId, email, passwordHash]);
    await pool.query(
      'INSERT INTO profiles (id, email, full_name, role, phone) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, full_name, role, phone || null]
    );
    await pool.query(
      `INSERT INTO notification_settings (user_id, email_enabled, sms_enabled, in_app_enabled, browser_push_enabled, category_thresholds)
       VALUES ($1, true, false, true, true, $2) ON CONFLICT (user_id) DO NOTHING`,
      [userId, JSON.stringify({ Electronics: 5, Furniture: 3, Lighting: 4, 'Smart Home': 5, Accessories: 10 })]
    );
    await pool.query('COMMIT');

    res.json({ success: true, userId, email, role, tempPassword: password ? undefined : plainPassword });
  } catch (err: any) {
    await pool.query('ROLLBACK').catch(() => {});
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
