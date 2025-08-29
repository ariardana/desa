import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

const complaintSchema = Joi.object({
  title: Joi.string().min(5).max(255).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().required(),
  location: Joi.string().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
});

// Get all complaints (with role-based filtering)
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const { page = 1, limit = 10, status, category } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = `
      SELECT c.*, u.full_name as user_name, a.full_name as assigned_name
      FROM complaints c 
      LEFT JOIN users u ON c.user_id = u.id 
      LEFT JOIN users a ON c.assigned_to = a.id
    `;
    const params: any[] = [];

    // Role-based filtering
    if (req.user!.role === 'warga') {
      query += ` WHERE c.user_id = $${params.length + 1}`;
      params.push(req.user!.id);
    } else {
      query += ` WHERE 1=1`;
    }

    if (status) {
      query += ` AND c.status = $${params.length + 1}`;
      params.push(status);
    }

    if (category) {
      query += ` AND c.category = $${params.length + 1}`;
      params.push(category);
    }

    query += ` ORDER BY c.priority DESC, c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    res.json({
      complaints: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } finally {
    client.release();
  }
}));

// Create complaint
router.post('/', 
  authenticateToken, 
  uploadMiddleware.array('complaints', 3),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = complaintSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { title, description, category, location, priority } = value;
    const files = req.files as Express.Multer.File[];
    
    const attachments = files ? files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
    })) : [];

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO complaints (title, description, category, location, priority, user_id, attachments)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [title, description, category, location, priority, req.user!.id, JSON.stringify(attachments)]
      );

      res.status(201).json({
        message: 'Complaint submitted successfully',
        complaint: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Update complaint status (admin only)
router.patch('/:id/status', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const { status, response, assignedTo } = req.body;

    const validStatuses = ['submitted', 'in_progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE complaints SET 
         status = $1, response = $2, assigned_to = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 RETURNING *`,
        [status, response, assignedTo, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Complaint not found' });
      }

      res.json({
        message: 'Complaint status updated successfully',
        complaint: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Rate complaint (user only)
router.patch('/:id/rate', 
  authenticateToken, 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `UPDATE complaints SET 
         rating = $1, feedback = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND user_id = $4 AND status = 'resolved' RETURNING *`,
        [rating, feedback, id, req.user!.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Complaint not found or cannot be rated' });
      }

      res.json({
        message: 'Rating submitted successfully',
        complaint: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

export { router as complaintRoutes };