import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().min(2).required(),
  phone: Joi.string().optional(),
  address: Joi.string().optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Register
router.post('/register', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password, fullName, phone, address } = value;

  const client = await pool.connect();
  
  try {
    // Check if user exists
    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await client.query(
      `INSERT INTO users (email, password, full_name, phone, address) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role`,
      [email, hashedPassword, fullName, phone, address]
    );

    const user = result.rows[0];

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } finally {
    client.release();
  }
}));

// Login
router.post('/login', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, password } = value;

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, password, full_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } finally {
    client.release();
  }
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;
    
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, role, full_name, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );
    client.release();

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = result.rows[0];
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
}));

// Get current user
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  res.json({ user: req.user });
}));

export { router as authRoutes };