import express from 'express';
import { auth, studentOnly } from '../middleware/auth.js';

const router = express.Router();

// Get user notifications
router.get('/', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    const notifications = await db.all(`
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `, [userId]);

    const unreadCount = await db.get(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
    `, [userId]);

    res.json({ 
      notifications,
      unreadCount: unreadCount.count 
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const notificationId = req.params.id;
    const userId = req.user.id;

    await db.run(`
      UPDATE notifications
      SET is_read = 1
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.put('/read-all', auth, studentOnly, async (req, res) => {
  try {
    const db = req.app.get('db');
    const userId = req.user.id;

    await db.run(`
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
    `, [userId]);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
