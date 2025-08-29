import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const contactSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  position: Joi.string().required(),
  department: Joi.string().required(),
  phone: Joi.string().optional(),
  email: Joi.string().email().optional(),
  whatsapp: Joi.string().optional(),
  office_hours: Joi.string().optional(),
  photo: Joi.string().optional(),
});

// Get all contacts (public)
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 20, department, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = 'SELECT * FROM contacts WHERE 1=1';
    const params: any[] = [];

    if (department) {
      query += ` AND department = $${params.length + 1}`;
      params.push(department);
    }

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR position ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY department, position LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    res.json({
      contacts: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } finally {
    client.release();
  }
}));

// Create contact (admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = contactSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, position, department, phone, email, whatsapp, office_hours, photo } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO contacts (name, position, department, phone, email, whatsapp, office_hours, photo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [name, position, department, phone, email, whatsapp, office_hours, photo]
      );

      res.status(201).json({
        message: 'Contact created successfully',
        contact: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

export { router as contactRoutes };