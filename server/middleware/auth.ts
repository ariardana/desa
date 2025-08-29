import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    fullName: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Verify user still exists and is active
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, role, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    client.release();

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      fullName: result.rows[0].full_name,
    };

    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    next();
  };
};