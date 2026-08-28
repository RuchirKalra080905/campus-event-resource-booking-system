// ================================================================
// Notifications Controller
// ================================================================
const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const [notifications] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    );
    const [unreadCount] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.user_id]
    );
    res.json({ notifications, unread_count: unreadCount[0].count });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch notifications' }); }
};

exports.markAsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [req.params.id, req.user.user_id]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) { res.status(500).json({ error: 'Failed to update notification' }); }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.user_id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) { res.status(500).json({ error: 'Failed to update notifications' }); }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.user_id]
    );
    res.json({ count: result[0].count });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch count' }); }
};
