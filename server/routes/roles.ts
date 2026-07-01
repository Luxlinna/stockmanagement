import { Router } from 'express';
import { pool } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const DEFAULT_ROLES = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all pages',
    permissions: {
      dashboard: true, inventory: true, orders: true, deliveries: true,
      warehouses: true, transfers: true, returns: true, purchases: true,
      promotions: true, vendors: true, reports: true, teams: true,
      requirements: true, roles: true, categories: true,
      notifications_history: true, notifications_analytics: true, notifications_settings: true,
    },
    is_system: true,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Access to operational pages',
    permissions: {
      dashboard: true, inventory: true, orders: true, deliveries: true,
      warehouses: true, transfers: true, returns: true, purchases: true,
      promotions: true, vendors: true, reports: true, teams: false,
      requirements: false, roles: false, categories: false,
      notifications_history: true, notifications_analytics: false, notifications_settings: true,
    },
    is_system: true,
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to basic pages',
    permissions: {
      dashboard: true, inventory: true, orders: true, deliveries: true,
      warehouses: true, transfers: false, returns: false, purchases: false,
      promotions: false, vendors: false, reports: true, teams: false,
      requirements: false, roles: false, categories: false,
      notifications_history: false, notifications_analytics: false, notifications_settings: false,
    },
    is_system: true,
  },
];

export async function ensureRolesTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      permissions JSONB NOT NULL DEFAULT '{}',
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  for (const role of DEFAULT_ROLES) {
    await pool.query(
      `INSERT INTO roles (id, name, description, permissions, is_system)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [role.id, role.name, role.description, JSON.stringify(role.permissions), role.is_system]
    );
  }
}

// GET /roles — list all roles
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles ORDER BY created_at ASC');
    res.json({ data: rows, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /roles/:id — get single role with permissions
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ data: null, error: 'Role not found' });
    res.json({ data: rows[0], error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// POST /roles — create a new role
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { name, description, permissions } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ data: null, error: 'Name is required' });
  }

  const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  try {
    const { rows } = await pool.query(
      `INSERT INTO roles (id, name, description, permissions, is_system)
       VALUES ($1, $2, $3, $4, false)
       RETURNING *`,
      [id, name.trim(), description || null, JSON.stringify(permissions ?? {})]
    );
    res.status(201).json({ data: rows[0], error: null });
  } catch (err: any) {
    const isDuplicate = err.code === '23505';
    res.status(isDuplicate ? 409 : 500).json({
      data: null,
      error: isDuplicate ? 'A role with this name already exists' : err.message,
    });
  }
});

// PATCH /roles/:id — update name, description, or permissions
router.patch('/:id', authenticate, async (req: AuthRequest, res) => {
  const { name, description, permissions } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM roles WHERE id = $1', [req.params.id]);
    if (!existing.rows[0]) {
      return res.status(404).json({ data: null, error: 'Role not found' });
    }

    const role = existing.rows[0];
    const updatedName        = role.is_system ? role.name        : (name?.trim()   ?? role.name);
    const updatedDescription = description !== undefined           ? description     : role.description;
    const updatedPermissions = permissions !== undefined           ? permissions     : role.permissions;

    const { rows } = await pool.query(
      `UPDATE roles
       SET name = $1, description = $2, permissions = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [updatedName, updatedDescription, JSON.stringify(updatedPermissions), req.params.id]
    );
    res.json({ data: rows[0], error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// DELETE /roles/:id — delete a custom role (system roles are protected)
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rows } = await pool.query('SELECT is_system FROM roles WHERE id = $1', [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ data: null, error: 'Role not found' });
    }
    if (rows[0].is_system) {
      return res.status(403).json({ data: null, error: 'System roles cannot be deleted' });
    }

    await pool.query('DELETE FROM roles WHERE id = $1', [req.params.id]);
    res.json({ data: { id: req.params.id }, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

export default router;
