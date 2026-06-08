import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { JWT_SECRET, authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

function makeUserObj(id: string, email: string, role: string) {
  return { id, email, user_metadata: { role } };
}

// POST /auth/signup
router.post('/signup', async (req, res) => {
  const { email, password, full_name = 'User', role = 'staff', phone } = req.body;
  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'Email and password are required' });
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const seq = String(Number(countResult.rows[0].count) + 1).padStart(3, '0');
    const userId = `USR-${seq}`;

    await pool.query('BEGIN');
    await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [userId, email, passwordHash]
    );
    await pool.query(
      'INSERT INTO profiles (id, email, full_name, role, phone) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, full_name, role, phone || null]
    );
    await pool.query(
      `INSERT INTO notification_settings (user_id, email_enabled, sms_enabled, in_app_enabled, browser_push_enabled, category_thresholds)
       VALUES ($1, true, false, true, true, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, JSON.stringify({ Electronics: 5, Furniture: 3, Lighting: 4, 'Smart Home': 5, Accessories: 10 })]
    );
    await pool.query('COMMIT');

    const user = makeUserObj(userId, email, role);
    const token = jwt.sign({ id: userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
    const session = { access_token: token, user };

    res.json({ data: { user, session }, error: null });
  } catch (err: any) {
    await pool.query('ROLLBACK');
    const isDuplicate = err.code === '23505';
    res.status(isDuplicate ? 409 : 500).json({
      data: null,
      error: isDuplicate ? 'Email already registered' : err.message,
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'Email and password are required' });
  }
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const dbUser = result.rows[0];

    if (!dbUser || !(await bcrypt.compare(password, dbUser.password_hash))) {
      return res.status(401).json({ data: null, error: 'Invalid email or password' });
    }

    const profileResult = await pool.query('SELECT role FROM profiles WHERE id = $1', [dbUser.id]);
    const role = profileResult.rows[0]?.role || 'staff';

    const user = makeUserObj(dbUser.id, dbUser.email, role);
    const token = jwt.sign({ id: dbUser.id, email: dbUser.email, role }, JWT_SECRET, { expiresIn: '7d' });
    const session = { access_token: token, user };

    res.json({ data: { user, session }, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: err.message });
  }
});

// GET /auth/session
router.get('/session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.json({ data: { session: null } });
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = makeUserObj(payload.id, payload.email, payload.role);
    res.json({ data: { session: { access_token: token, user } } });
  } catch {
    res.json({ data: { session: null } });
  }
});

// GET /auth/user
router.get('/user', authenticate, (req: AuthRequest, res) => {
  const { id, email, role } = req.user!;
  res.json({ data: { user: makeUserObj(id, email, role) } });
});

// POST /auth/logout
router.post('/logout', (_req, res) => {
  res.json({ error: null });
});

export default router;
