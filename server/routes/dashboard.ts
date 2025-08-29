import express from 'express';
import { pool } from '../config/database.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const client = await pool.connect();
    
    try {
      // Get various statistics
      const [
        usersCount,
        announcementsCount,
        complaintsCount,
        eventsCount,
        documentsCount,
        recentComplaints,
        complaintsByStatus,
        announcementsByCategory,
      ] = await Promise.all([
        client.query('SELECT COUNT(*) FROM users WHERE is_active = true'),
        client.query('SELECT COUNT(*) FROM announcements WHERE status = \'published\''),
        client.query('SELECT COUNT(*) FROM complaints'),
        client.query('SELECT COUNT(*) FROM events WHERE start_date >= CURRENT_DATE'),
        client.query('SELECT COUNT(*) FROM documents WHERE is_public = true'),
        client.query(`
          SELECT c.*, u.full_name as user_name 
          FROM complaints c 
          LEFT JOIN users u ON c.user_id = u.id 
          ORDER BY c.created_at DESC LIMIT 5
        `),
        client.query(`
          SELECT status, COUNT(*) as count 
          FROM complaints 
          GROUP BY status
        `),
        client.query(`
          SELECT category, COUNT(*) as count 
          FROM announcements 
          WHERE status = 'published'
          GROUP BY category
        `),
      ]);

      const stats = {
        users: parseInt(usersCount.rows[0].count),
        announcements: parseInt(announcementsCount.rows[0].count),
        complaints: parseInt(complaintsCount.rows[0].count),
        events: parseInt(eventsCount.rows[0].count),
        documents: parseInt(documentsCount.rows[0].count),
        recentComplaints: recentComplaints.rows,
        complaintsByStatus: complaintsByStatus.rows,
        announcementsByCategory: announcementsByCategory.rows,
      };

      res.json(stats);
    } finally {
      client.release();
    }
  })
);

// Get analytics data
router.get('/analytics', 
  authenticateToken, 
  authorizeRoles('admin', 'super_admin'), 
  asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
    const { period = '7d' } = req.query;
    
    const client = await pool.connect();
    
    try {
      let dateFilter = '';
      
      switch (period) {
        case '7d':
          dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
          break;
        case '30d':
          dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
          break;
        case '90d':
          dateFilter = "created_at >= NOW() - INTERVAL '90 days'";
          break;
        default:
          dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
      }

      const [
        userRegistrations,
        complaintTrends,
        documentDownloads,
      ] = await Promise.all([
        client.query(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM users 
          WHERE ${dateFilter}
          GROUP BY DATE(created_at) 
          ORDER BY date
        `),
        client.query(`
          SELECT DATE(created_at) as date, COUNT(*) as count 
          FROM complaints 
          WHERE ${dateFilter}
          GROUP BY DATE(created_at) 
          ORDER BY date
        `),
        client.query(`
          SELECT title, download_count 
          FROM documents 
          WHERE is_public = true 
          ORDER BY download_count DESC 
          LIMIT 10
        `),
      ]);

      res.json({
        userRegistrations: userRegistrations.rows,
        complaintTrends: complaintTrends.rows,
        documentDownloads: documentDownloads.rows,
      });
    } finally {
      client.release();
    }
  })
);

export { router as dashboardRoutes };