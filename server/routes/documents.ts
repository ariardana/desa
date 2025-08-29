import express from 'express';
import Joi from 'joi';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = express.Router();

const documentSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  description: Joi.string().optional(),
  category: Joi.string().required(),
  isPublic: Joi.boolean().default(true),
});

// Get all documents (public)
router.get('/', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const client = await pool.connect();
  
  try {
    let query = `
      SELECT d.*, u.full_name as uploaded_by_name 
      FROM documents d 
      LEFT JOIN users u ON d.uploaded_by = u.id 
      WHERE d.is_public = true
    `;
    const params: any[] = [];

    if (category) {
      query += ` AND d.category = $${params.length + 1}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (d.title ILIKE $${params.length + 1} OR d.description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await client.query(query, params);

    res.json({
      documents: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
      },
    });
  } finally {
    client.release();
  }
}));

// Upload document (admin only)
router.post('/', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  uploadMiddleware.single('documents'),
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { error, value } = documentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Document file is required' });
    }

    const { title, description, category, isPublic } = value;
    const file = req.file;

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        `INSERT INTO documents (title, description, category, file_path, file_size, mime_type, uploaded_by, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [title, description, category, file.path, file.size, file.mimetype, req.user!.id, isPublic]
      );

      res.status(201).json({
        message: 'Document uploaded successfully',
        document: result.rows[0],
      });
    } finally {
      client.release();
    }
  })
);

// Download document
router.get('/:id/download', asyncHandler(async (req: express.Request, res: express.Response) => {
  const { id } = req.params;

  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT * FROM documents WHERE id = $1 AND is_public = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const document = result.rows[0];

    // Update download count
    await client.query(
      'UPDATE documents SET download_count = download_count + 1 WHERE id = $1',
      [id]
    );

    res.download(document.file_path, document.title);
  } finally {
    client.release();
  }
}));

// Delete document
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { id } = req.params;

    const client = await pool.connect();
    
    try {
      const result = await client.query('DELETE FROM documents WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Document not found' });
      }

      res.json({ message: 'Document deleted successfully' });
    } finally {
      client.release();
    }
  })
);

export { router as documentRoutes };