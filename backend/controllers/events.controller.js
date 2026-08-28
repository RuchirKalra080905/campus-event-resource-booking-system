// ================================================================
// Events Controller - CRUD, Search, Filter, Approve/Reject
// Demonstrates: JOINs, Parameterized queries, Subqueries, Transactions
// ================================================================
const db = require('../config/db');

// GET /api/events - List events with search/filter
exports.getEvents = async (req, res) => {
  try {
    const { search, category_id, venue_id, status, date_from, date_to, sort, page = 1, limit = 20 } = req.query;
    
    let query = `
      SELECT e.*, ec.category_name, u.name AS organizer_name, u.department,
             v.venue_name, v.building,
             (SELECT COUNT(*) FROM event_registrations er 
              WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled') AS registered_count
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE 1=1
    `;
    const params = [];

    // For non-admin users, only show approved events (or their own)
    if (req.user.role === 'student') {
      query += ' AND (e.status = ? OR e.organizer_id = ?)';
      params.push('approved', req.user.user_id);
    } else if (req.user.role === 'faculty') {
      query += ' AND (e.status = ? OR e.organizer_id = ?)';
      params.push('approved', req.user.user_id);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      query += ' AND e.category_id = ?';
      params.push(category_id);
    }
    if (venue_id) {
      query += ' AND e.venue_id = ?';
      params.push(venue_id);
    }
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    if (date_from) {
      query += ' AND e.event_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND e.event_date <= ?';
      params.push(date_to);
    }

    // Sorting
    switch (sort) {
      case 'date_asc': query += ' ORDER BY e.event_date ASC'; break;
      case 'date_desc': query += ' ORDER BY e.event_date DESC'; break;
      case 'title': query += ' ORDER BY e.title ASC'; break;
      case 'popular': query += ' ORDER BY registered_count DESC'; break;
      default: query += ' ORDER BY e.created_at DESC';
    }

    // Pagination
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [events] = await db.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM events e WHERE 1=1';
    const countParams = [];
    if (req.user.role !== 'admin') {
      countQuery += ' AND (e.status = ? OR e.organizer_id = ?)';
      countParams.push('approved', req.user.user_id);
    }
    if (search) {
      countQuery += ' AND (e.title LIKE ? OR e.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    if (status) {
      countQuery += ' AND e.status = ?';
      countParams.push(status);
    }
    const [countResult] = await db.query(countQuery, countParams);

    res.json({ events, total: countResult[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// GET /api/events/:id - Get single event with details
exports.getEvent = async (req, res) => {
  try {
    const [events] = await db.query(`
      SELECT e.*, ec.category_name, u.name AS organizer_name, u.department AS organizer_department,
             v.venue_name, v.building, v.capacity AS venue_capacity, v.facilities,
             (SELECT COUNT(*) FROM event_registrations er 
              WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled') AS registered_count,
             (SELECT AVG(rating) FROM event_feedback ef WHERE ef.event_id = e.event_id) AS avg_rating,
             (SELECT COUNT(*) FROM event_feedback ef WHERE ef.event_id = e.event_id) AS feedback_count
      FROM events e
      LEFT JOIN event_categories ec ON e.category_id = ec.category_id
      LEFT JOIN users u ON e.organizer_id = u.user_id
      LEFT JOIN venues v ON e.venue_id = v.venue_id
      WHERE e.event_id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = events[0];

    // Check if current user is registered
    const [reg] = await db.query(
      'SELECT registration_id, attendance_status FROM event_registrations WHERE event_id = ? AND user_id = ? AND attendance_status != ?',
      [req.params.id, req.user.user_id, 'cancelled']
    );
    event.is_registered = reg.length > 0;
    event.registration = reg[0] || null;

    res.json(event);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// POST /api/events - Create event
exports.createEvent = async (req, res) => {
  try {
    const { title, description, category_id, venue_id, event_date, start_time, end_time, max_participants } = req.body;

    if (!title || !event_date || !start_time || !end_time || !max_participants) {
      return res.status(400).json({ error: 'Title, date, time, and max participants are required' });
    }

    // Validate venue capacity
    if (venue_id) {
      const [venues] = await db.query('SELECT capacity FROM venues WHERE venue_id = ? AND status = ?', [venue_id, 'available']);
      if (venues.length === 0) {
        return res.status(400).json({ error: 'Venue not found or not available' });
      }
      if (max_participants > venues[0].capacity) {
        return res.status(400).json({ error: `Max participants (${max_participants}) exceeds venue capacity (${venues[0].capacity})` });
      }

      // Check for venue time conflicts (overlapping bookings)
      const [conflicts] = await db.query(`
        SELECT event_id, title FROM events 
        WHERE venue_id = ? AND event_date = ? AND status IN ('approved', 'pending')
          AND start_time < ? AND end_time > ?
      `, [venue_id, event_date, end_time, start_time]);
      
      if (conflicts.length > 0) {
        return res.status(409).json({ error: 'Venue is already booked for this time slot', conflicting_event: conflicts[0].title });
      }
    }

    // Set status based on role: admin events auto-approved, others pending
    const status = req.user.role === 'admin' ? 'approved' : 'pending';

    const [result] = await db.query(
      `INSERT INTO events (title, description, category_id, organizer_id, venue_id, event_date, start_time, end_time, max_participants, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, category_id || null, req.user.user_id, venue_id || null, event_date, start_time, end_time, max_participants, status]
    );

    // Audit log
    await db.query(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'CREATE', 'events', result.insertId, `Event created: ${title}`]
    );

    // Notify admins about new event proposal (if not admin)
    if (req.user.role !== 'admin') {
      const [admins] = await db.query('SELECT user_id FROM users WHERE role = ?', ['admin']);
      for (const admin of admins) {
        await db.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [admin.user_id, 'New Event Proposal', `${req.user.role === 'faculty' ? 'Faculty' : 'User'} proposed event: "${title}"`, 'info']
        );
      }
    }

    res.status(201).json({ message: 'Event created successfully', event_id: result.insertId, status });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// PUT /api/events/:id - Update event
exports.updateEvent = async (req, res) => {
  try {
    const { title, description, category_id, venue_id, event_date, start_time, end_time, max_participants } = req.body;
    const eventId = req.params.id;

    // Check ownership or admin
    const [events] = await db.query('SELECT organizer_id, status FROM events WHERE event_id = ?', [eventId]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (req.user.role !== 'admin' && events[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    // Validate venue if changed
    if (venue_id) {
      const [venues] = await db.query('SELECT capacity FROM venues WHERE venue_id = ? AND status = ?', [venue_id, 'available']);
      if (venues.length === 0) return res.status(400).json({ error: 'Venue not found or not available' });
      if (max_participants && max_participants > venues[0].capacity) {
        return res.status(400).json({ error: 'Max participants exceeds venue capacity' });
      }
    }

    await db.query(
      `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description),
       category_id = COALESCE(?, category_id), venue_id = COALESCE(?, venue_id),
       event_date = COALESCE(?, event_date), start_time = COALESCE(?, start_time),
       end_time = COALESCE(?, end_time), max_participants = COALESCE(?, max_participants)
       WHERE event_id = ?`,
      [title, description, category_id, venue_id, event_date, start_time, end_time, max_participants, eventId]
    );

    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// PUT /api/events/:id/status - Approve/Reject/Cancel event (Admin)
exports.updateEventStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const eventId = req.params.id;

    if (!['approved', 'rejected', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [events] = await db.query('SELECT title, organizer_id, status as current_status FROM events WHERE event_id = ?', [eventId]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });

    // Update status (triggers will handle notifications and audit)
    await db.query('UPDATE events SET status = ? WHERE event_id = ?', [status, eventId]);

    // If cancelling approved event, notify all registered users
    if (status === 'cancelled' && events[0].current_status === 'approved') {
      const [registrations] = await db.query(
        'SELECT user_id FROM event_registrations WHERE event_id = ? AND attendance_status = ?',
        [eventId, 'registered']
      );
      for (const reg of registrations) {
        await db.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [reg.user_id, 'Event Cancelled', `The event "${events[0].title}" has been cancelled.`, 'warning']
        );
      }
    }

    res.json({ message: `Event ${status} successfully` });
  } catch (error) {
    console.error('Update event status error:', error);
    res.status(500).json({ error: 'Failed to update event status' });
  }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res) => {
  try {
    const [events] = await db.query('SELECT organizer_id, title FROM events WHERE event_id = ?', [req.params.id]);
    if (events.length === 0) return res.status(404).json({ error: 'Event not found' });
    if (req.user.role !== 'admin' && events[0].organizer_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await db.query('DELETE FROM events WHERE event_id = ?', [req.params.id]);
    
    await db.query(
      'INSERT INTO audit_logs (user_id, action, table_name, record_id, description) VALUES (?, ?, ?, ?, ?)',
      [req.user.user_id, 'DELETE', 'events', req.params.id, `Event deleted: ${events[0].title}`]
    );

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
