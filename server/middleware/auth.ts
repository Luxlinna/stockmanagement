import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'stockmanagement-local-secret-2026';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ data: null, error: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    next();
  } catch {
    res.status(401).json({ data: null, error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    } catch { /* ignore */ }
  }
  next();
}
