import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const announcementSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  content: Joi.string().min(10).required(),
  category: Joi.string().valid('urgent', 'info', 'event').default('info'),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  scheduledAt: Joi.date().optional(),
});

// Get all announcements (public)
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = `
      SELECT a.*, u.full_name as author_name 
      FROM announcements a 
      LEFT JOIN users u ON a.author_id = u.id 
      WHERE a.status = 'published' AND (a.scheduled_at IS NULL OR a.scheduled_at <= NOW())
    `;
    const params: (string | number)[] = [];

    if (category) {
      query += ` AND a.category = ${params.length + 1}`;
      params.push(String(category));
    }

    if (search) {
            query += ` AND (a.title ILIKE ${params.length + 1} OR a.content ILIKE ${params.length + 1})`
      params.push(`%${String(search)}%`);
    }

    query += ` ORDER BY a.priority DESC, a.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM announcements WHERE status = \'published\'';
    const countParams: (string | number)[] = [];

    if (category) {
      countQuery += ` AND category = ${countParams.length + 1}`;
      countParams.push(String(category));
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      announcements: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } finally {
    client.release();
  }
}));

// Create announcement (admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = announcementSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, content, category, priority, scheduledAt } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO announcements (title, content, category, priority, author_id, scheduled_at, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          title,
          content,
          category,
          priority,
          req.user!.id,
          scheduledAt || null,
          scheduledAt ? 'scheduled' : 'published',
          scheduledAt ? null : new Date(),
        ]
      );

      res.status(201).json({
        message: 'Announcement created successfully',
        announcement: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Update announcement
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const { error, value } = announcementSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, content, category, priority, scheduledAt } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE announcements SET 
         title = $1, content = $2, category = $3, priority = $4, 
         scheduled_at = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [title, content, category, priority, scheduledAt || null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json({
        message: 'Announcement updated successfully',
        announcement: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Delete announcement
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Announcement not found' });
      }

      res.json({ message: 'Announcement deleted successfully' });
    } finally {
      client.release();
    }
  })
);

export { router as announcementRoutes };