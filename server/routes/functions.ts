import { Router } from 'express';
import { pool } from '../db';

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

export default router;
