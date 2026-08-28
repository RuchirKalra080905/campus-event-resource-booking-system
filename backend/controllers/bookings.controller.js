// ================================================================
// Bookings Controller - Resource Booking CRUD, Approve/Reject
// Demonstrates: Transactions, Overlap detection, Quantity management
// ================================================================
const db = require('../config/db');

// POST /api/bookings - Create booking request
exports.createBooking = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { resource_id, event_id, quantity, booking_date, start_datetime, end_datetime, purpose } = req.body;

    if (!resource_id || !quantity || !booking_date || !start_datetime || !end_datetime) {
      return res.status(400).json({ error: 'Resource, quantity, date, and time are required' });
    }

    await conn.beginTransaction();

    // Check resource availability
    const [resources] = await conn.query(
      'SELECT resource_name, available_quantity, status FROM resources WHERE resource_id = ? FOR UPDATE',
      [resource_id]
    );

    if (resources.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Resource not found' });
    }
    if (resources[0].status !== 'available') {
      await conn.rollback();
      return res.status(400).json({ error: 'Resource is not available' });
    }
    if (quantity > resources[0].available_quantity) {
      await conn.rollback();
      return res.status(400).json({ error: `Only ${resources[0].available_quantity} units available` });
    }

    // Check time overlap with approved bookings
    const [overlaps] = await conn.query(`
      SELECT booking_id FROM resource_bookings
      WHERE resource_id = ? AND status = 'approved'
        AND start_datetime < ? AND end_datetime > ?
    `, [resource_id, end_datetime, start_datetime]);

    if (overlaps.length > 0) {
      await conn.rollback();
      return res.status(409).json({ error: 'Time slot conflicts with an existing approved booking' });
    }

    // Create booking
    const [result] = await conn.query(
      `INSERT INTO resource_bookings (resource_id, user_id, event_id, quantity, booking_date, start_datetime, end_datetime, purpose, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [resource_id, req.user.user_id, event_id || null, quantity, booking_date, start_datetime, end_datetime, purpose || null]
    );

    // Notify admins
    const [admins] = await conn.query('SELECT user_id FROM users WHERE role = ?', ['admin']);
    for (const admin of admins) {
      await conn.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [admin.user_id, 'New Booking Request', `Booking request for ${resources[0].resource_name} (qty: ${quantity})`, 'info']
      );
    }

    await conn.commit();
    res.status(201).json({ message: 'Booking request submitted', booking_id: result.insertId });
  } catch (error) {
    await conn.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  } finally {
    conn.release();
  }
};

// GET /api/bookings - Get bookings (filtered by user role)
exports.getBookings = async (req, res) => {
  try {
    const { status, resource_id, user_id } = req.query;
    let query = `
      SELECT rb.*, r.resource_name, r.resource_type, u.name AS user_name, u.email AS user_email,
             e.title AS event_title,
             ab.name AS approved_by_name
      FROM resource_bookings rb
      INNER JOIN resources r ON rb.resource_id = r.resource_id
      INNER JOIN users u ON rb.user_id = u.user_id
      LEFT JOIN events e ON rb.event_id = e.event_id
      LEFT JOIN users ab ON rb.approved_by = ab.user_id
      WHERE 1=1
    `;
    const params = [];

    // Non-admin users see only their own bookings
    if (req.user.role !== 'admin') {
      query += ' AND rb.user_id = ?';
      params.push(req.user.user_id);
    } else if (user_id) {
      query += ' AND rb.user_id = ?';
      params.push(user_id);
    }

    if (status) {
      query += ' AND rb.status = ?';
      params.push(status);
    }
    if (resource_id) {
      query += ' AND rb.resource_id = ?';
      params.push(resource_id);
    }

    query += ' ORDER BY rb.created_at DESC';

    const [bookings] = await db.query(query, params);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// PUT /api/bookings/:id/approve - Approve booking (Admin)
exports.approveBooking = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const bookingId = req.params.id;

    await conn.beginTransaction();

    const [bookings] = await conn.query(`
      SELECT rb.*, r.resource_name, r.available_quantity 
      FROM resource_bookings rb
      INNER JOIN resources r ON rb.resource_id = r.resource_id
      WHERE rb.booking_id = ? FOR UPDATE
    `, [bookingId]);

    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = bookings[0];
    if (booking.status !== 'pending') {
      await conn.rollback();
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }
    if (booking.quantity > booking.available_quantity) {
      await conn.rollback();
      return res.status(400).json({ error: 'Insufficient resource quantity' });
    }

    // Approve booking
    await conn.query(
      'UPDATE resource_bookings SET status = ?, approved_by = ?, approved_at = NOW() WHERE booking_id = ?',
      ['approved', req.user.user_id, bookingId]
    );

    // Update resource available quantity
    await conn.query(
      'UPDATE resources SET available_quantity = available_quantity - ? WHERE resource_id = ?',
      [booking.quantity, booking.resource_id]
    );

    // Notify user
    await conn.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [booking.user_id, 'Booking Approved', `Your booking for "${booking.resource_name}" has been approved.`, 'success']
    );

    await conn.commit();
    res.json({ message: 'Booking approved' });
  } catch (error) {
    await conn.rollback();
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  } finally {
    conn.release();
  }
};

// PUT /api/bookings/:id/reject - Reject booking (Admin)
exports.rejectBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const [bookings] = await db.query(
      'SELECT user_id, resource_id, status FROM resource_bookings rb INNER JOIN resources r ON rb.resource_id = r.resource_id WHERE booking_id = ?',
      [bookingId]
    );
    if (bookings.length === 0) return res.status(404).json({ error: 'Booking not found' });
    if (bookings[0].status !== 'pending') return res.status(400).json({ error: 'Booking is not in pending status' });

    await db.query('UPDATE resource_bookings SET status = ? WHERE booking_id = ?', ['rejected', bookingId]);

    const [resources] = await db.query('SELECT resource_name FROM resources WHERE resource_id = (SELECT resource_id FROM resource_bookings WHERE booking_id = ?)', [bookingId]);

    await db.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [bookings[0].user_id, 'Booking Rejected', `Your booking for "${resources[0]?.resource_name}" has been rejected.`, 'error']
    );

    res.json({ message: 'Booking rejected' });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
};

// PUT /api/bookings/:id/cancel - Cancel own booking
exports.cancelBooking = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const bookingId = req.params.id;

    await conn.beginTransaction();

    const [bookings] = await conn.query(
      'SELECT * FROM resource_bookings WHERE booking_id = ? FOR UPDATE',
      [bookingId]
    );
    if (bookings.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookings[0];
    if (req.user.role !== 'admin' && booking.user_id !== req.user.user_id) {
      await conn.rollback();
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (['cancelled', 'completed'].includes(booking.status)) {
      await conn.rollback();
      return res.status(400).json({ error: 'Booking cannot be cancelled' });
    }

    // If was approved, restore quantity
    if (booking.status === 'approved') {
      await conn.query(
        'UPDATE resources SET available_quantity = available_quantity + ? WHERE resource_id = ?',
        [booking.quantity, booking.resource_id]
      );
    }

    await conn.query('UPDATE resource_bookings SET status = ? WHERE booking_id = ?', ['cancelled', bookingId]);
    await conn.commit();

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    await conn.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  } finally {
    conn.release();
  }
};
