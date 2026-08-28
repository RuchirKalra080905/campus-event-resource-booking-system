// ================================================================
// Registrations Controller - Event Registration & Cancellation
// Demonstrates: Transactions, Capacity checks, UNIQUE constraints
// ================================================================
const db = require('../config/db');

// POST /api/registrations/:eventId - Register for event
exports.registerForEvent = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const eventId = req.params.eventId;
    const userId = req.user.user_id;

    await conn.beginTransaction();

    // Get event details with row lock for concurrency safety
    const [events] = await conn.query(
      'SELECT event_id, title, status, max_participants FROM events WHERE event_id = ? FOR UPDATE',
      [eventId]
    );

    if (events.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];
    if (event.status !== 'approved') {
      await conn.rollback();
      return res.status(400).json({ error: 'Event is not open for registration' });
    }

    // Check duplicate registration
    const [existing] = await conn.query(
      'SELECT registration_id FROM event_registrations WHERE event_id = ? AND user_id = ? AND attendance_status != ?',
      [eventId, userId, 'cancelled']
    );
    if (existing.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Already registered for this event' });
    }

    // Check capacity
    const [countResult] = await conn.query(
      'SELECT COUNT(*) as count FROM event_registrations WHERE event_id = ? AND attendance_status != ?',
      [eventId, 'cancelled']
    );
    if (countResult[0].count >= event.max_participants) {
      await conn.rollback();
      return res.status(400).json({ error: 'Event is at full capacity' });
    }

    // Register
    const [result] = await conn.query(
      'INSERT INTO event_registrations (event_id, user_id, attendance_status) VALUES (?, ?, ?)',
      [eventId, userId, 'registered']
    );

    // Create notification
    await conn.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, 'Registration Confirmed', `You have been registered for "${event.title}".`, 'success']
    );

    await conn.commit();

    res.status(201).json({
      message: 'Registration successful',
      registration_id: result.insertId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    conn.release();
  }
};

// DELETE /api/registrations/:eventId - Cancel registration
exports.cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.user_id;

    const [reg] = await db.query(
      'SELECT registration_id, attendance_status FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [eventId, userId]
    );

    if (reg.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    if (reg[0].attendance_status === 'cancelled') {
      return res.status(400).json({ error: 'Registration already cancelled' });
    }

    await db.query(
      'UPDATE event_registrations SET attendance_status = ? WHERE event_id = ? AND user_id = ?',
      ['cancelled', eventId, userId]
    );

    // Get event title for notification
    const [events] = await db.query('SELECT title FROM events WHERE event_id = ?', [eventId]);
    
    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [userId, 'Registration Cancelled', `Your registration for "${events[0]?.title || 'event'}" has been cancelled.`, 'info']
    );

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

// GET /api/registrations/my - Get user's registrations
exports.getMyRegistrations = async (req, res) => {
  try {
    const [registrations] = await db.query(`
      SELECT er.*, e.title, e.event_date, e.start_time, e.end_time, e.status AS event_status,
             ec.category_name, v.venue_name, v.building,
             u.name AS organizer_name
      FROM event_registrations er
      INNER JOIN events e ON er.event_id = e.event_id
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      LEFT JOIN users u ON e.organizer_id = u.user_id
      WHERE er.user_id = ?
      ORDER BY e.event_date DESC
    `, [req.user.user_id]);

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

// GET /api/registrations/event/:eventId - Get registrations for an event (organizer/admin)
exports.getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check access: organizer or admin
    if (req.user.role !== 'admin') {
      const [events] = await db.query('SELECT organizer_id FROM events WHERE event_id = ?', [eventId]);
      if (events.length === 0) return res.status(404).json({ error: 'Event not found' });
      if (events[0].organizer_id !== req.user.user_id) {
        return res.status(403).json({ error: 'Not authorized' });
      }
    }

    const [registrations] = await db.query(`
      SELECT er.*, u.name, u.email, u.department, u.phone
      FROM event_registrations er
      INNER JOIN users u ON er.user_id = u.user_id
      WHERE er.event_id = ?
      ORDER BY er.registration_date DESC
    `, [eventId]);

    res.json(registrations);
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};
