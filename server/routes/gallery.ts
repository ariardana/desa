import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

const gallerySchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().optional(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()).optional(),
});

// Get gallery items (public)
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 12, category, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = `
      SELECT g.*, u.full_name as uploaded_by_name 
      FROM gallery g 
      LEFT JOIN users u ON g.uploaded_by = u.id 
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ` AND g.category = ${params.length + 1}`;
      params.push(String(category));
    }

    if (search) {
      query += ` AND (g.title ILIKE $${params.length + 1} OR g.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY g.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    res.json({
      gallery: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } finally {
    client.release();
  }
}));

// Upload gallery item (admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  uploadMiddleware.array('gallery', 10),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = gallerySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: 'At least one file is required' });
    }

    const { title, description, category, tags } = value;
    const files = req.files as Express.Multer.File[];

    const client = await pool.connect();
    
    try {
      const insertPromises = files.map(file => 
        client.query(
          `INSERT INTO gallery (title, description, category, file_path, file_size, mime_type, uploaded_by, tags)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [title, description, category, file.path, file.size, file.mimetype, req.user!.id, JSON.stringify(tags || [])]
        )
      );

      const results = await Promise.all(insertPromises);

      res.status(201).json({
        message: 'Gallery items uploaded successfully',
        items: results.map(r => r.rows[0]),
      });
    } finally {
      client.release();
    }
  })
);

export { router as galleryRoutes };