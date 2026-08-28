// ================================================================
// Feedback Controller - Event ratings and comments
// Demonstrates: CHECK constraint (rating 1-5), UNIQUE constraint
// ================================================================
const db = require('../config/db');

exports.submitFeedback = async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;
    if (!event_id || !rating) return res.status(400).json({ error: 'Event ID and rating are required' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    // Check if user was registered for the event
    const [reg] = await db.query(
      'SELECT registration_id FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [event_id, req.user.user_id]
    );
    if (reg.length === 0) return res.status(400).json({ error: 'You must be registered for the event to leave feedback' });

    const [result] = await db.query(
      'INSERT INTO event_feedback (event_id, user_id, rating, comment) VALUES (?,?,?,?)',
      [event_id, req.user.user_id, rating, comment || null]
    );
    res.status(201).json({ message: 'Feedback submitted', feedback_id: result.insertId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You have already submitted feedback for this event' });
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

exports.getEventFeedback = async (req, res) => {
  try {
    const [feedback] = await db.query(`
      SELECT ef.*, u.name AS user_name, u.department
      FROM event_feedback ef
      INNER JOIN users u ON ef.user_id = u.user_id
      WHERE ef.event_id = ?
      ORDER BY ef.created_at DESC
    `, [req.params.eventId]);

    const [stats] = await db.query(`
      SELECT AVG(rating) AS avg_rating, COUNT(*) AS total_feedback,
             SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
             SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
             SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
             SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
             SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
      FROM event_feedback WHERE event_id = ?
    `, [req.params.eventId]);

    res.json({ feedback, stats: stats[0] });
  } catch (error) { res.status(500).json({ error: 'Failed to fetch feedback' }); }
};
