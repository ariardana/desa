import express from 'express';
import bcrypt from 'bcryptjs';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(2).max(255).required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).required(),
});

// Get all users (admin only)
router.get('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const client = await pool.connect();
    
    try {
      let query = `
        SELECT id, email, full_name, role, is_active, phone, address, created_at 
        FROM users WHERE 1=1
      `;
      const params: any[] = [];

      if (search) {
        query += ` AND (full_name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }

      if (role) {
        query += ` AND role = $${params.length + 1}`;
        params.push(role);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const result = await client.query(query, params);

      res.json({
        users: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
        },
      });
    } finally {
      client.release();
    }
  })
);

// Update user profile
router.put('/profile', 
  authenticateToken, 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { fullName, phone, address } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE users SET 
         full_name = $1, phone = $2, address = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING id, email, full_name, role, phone, address`,
        [fullName, phone, address, req.user!.id]
      );

      res.json({
        message: 'Profile updated successfully',
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Change password
router.put('/password', 
  authenticateToken, 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    const client = await pool.connect();
    
    try {
      // Verify current password
      const userResult = await client.query('SELECT password FROM users WHERE id = $1', [req.user!.id]);
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userResult.rows[0].password);

      if (!isCurrentPasswordValid) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await client.query(
        'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [hashedNewPassword, req.user!.id]
      );

      res.json({ message: 'Password changed successfully' });
    } finally {
      client.release();
    }
  })
);

// Update user role (super admin only)
router.patch('/:id/role', 
  authenticateToken, 
  authorizeRoles('super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['warga', 'operator', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, full_name, role',
        [role, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        message: 'User role updated successfully',
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

export { router as userRoutes };