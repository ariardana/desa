import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

const eventSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().optional(),
  startDate: Joi.date().required(),
  endDate: Joi.date().optional(),
  location: Joi.string().optional(),
  organizer: Joi.string().optional(),
  category: Joi.string().required(),
  maxParticipants: Joi.number().min(1).optional(),
  isPublic: Joi.boolean().default(true),
});

// Get all events (public)
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, category, month, year } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = `
      SELECT e.*, u.full_name as creator_name 
      FROM events e 
      LEFT JOIN users u ON e.created_by = u.id 
      WHERE e.is_public = true
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND e.category = $${params.length + 1}`;
      params.push(category);
    }

    if (month && year) {
      query += ` AND EXTRACT(MONTH FROM e.start_date) = $${params.length + 1} 
                 AND EXTRACT(YEAR FROM e.start_date) = $${params.length + 2}`;
      params.push(Number(month), Number(year));
    }

    query += ` ORDER BY e.start_date ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    res.json({
      events: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } finally {
    client.release();
  }
}));

// Create event (admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, startDate, endDate, location, organizer, category, maxParticipants, isPublic } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO events (title, description, start_date, end_date, location, organizer, category, max_participants, is_public, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [title, description, startDate, endDate, location, organizer, category, maxParticipants, isPublic, req.user!.id]
      );

      res.status(201).json({
        message: 'Event created successfully',
        event: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Update event
router.put('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const { error, value } = eventSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, startDate, endDate, location, organizer, category, maxParticipants, isPublic } = value;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE events SET 
         title = $1, description = $2, start_date = $3, end_date = $4, 
         location = $5, organizer = $6, category = $7, max_participants = $8, 
         is_public = $9, updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 RETURNING *`,
        [title, description, startDate, endDate, location, organizer, category, maxParticipants, isPublic, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({
        message: 'Event updated successfully',
        event: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Delete event
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event deleted successfully' });
    } finally {
      client.release();
    }
  })
);

export { router as eventRoutes };