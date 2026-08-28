// ================================================================
// Dashboard Controller - Role-specific statistics
// Demonstrates: Aggregate queries, JOINs, Subqueries, GROUP BY
// ================================================================
const db = require('../config/db');

// GET /api/dashboard - Role-specific dashboard data
exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    if (role === 'admin') {
      return await getAdminDashboard(res);
    } else if (role === 'faculty') {
      return await getFacultyDashboard(res, userId);
    } else {
      return await getStudentDashboard(res, userId);
    }
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

async function getAdminDashboard(res) {
  // Aggregate queries with COUNT, SUM
  const [userStats] = await db.query(`
    SELECT COUNT(*) as total_users,
           SUM(CASE WHEN role='student' THEN 1 ELSE 0 END) as students,
           SUM(CASE WHEN role='faculty' THEN 1 ELSE 0 END) as faculty,
           SUM(CASE WHEN role='admin' THEN 1 ELSE 0 END) as admins
    FROM users
  `);

  const [eventStats] = await db.query(`
    SELECT COUNT(*) as total_events,
           SUM(CASE WHEN status='approved' AND event_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_events,
           SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_events,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed_events
    FROM events
  `);

  const [resourceStats] = await db.query(`
    SELECT COUNT(*) as total_resources,
           SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available_resources
    FROM resources
  `);

  const [bookingStats] = await db.query(`
    SELECT COUNT(*) as total_bookings,
           SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_bookings,
           SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved_bookings
    FROM resource_bookings
  `);

  const [registrationStats] = await db.query(
    "SELECT COUNT(*) as total_registrations FROM event_registrations WHERE attendance_status != 'cancelled'"
  );

  // Events by category for chart (GROUP BY)
  const [eventsByCategory] = await db.query(`
    SELECT ec.category_name, COUNT(e.event_id) as count
    FROM event_categories ec LEFT JOIN events e ON ec.category_id = e.category_id
    GROUP BY ec.category_id, ec.category_name HAVING count > 0 ORDER BY count DESC
  `);

  // Registrations by month (GROUP BY, DATE_FORMAT)
  const [regByMonth] = await db.query(`
    SELECT DATE_FORMAT(registration_date, '%Y-%m') as month,
           DATE_FORMAT(registration_date, '%b %Y') as label,
           COUNT(*) as count
    FROM event_registrations WHERE attendance_status != 'cancelled'
    GROUP BY month, label ORDER BY month DESC LIMIT 12
  `);

  // User distribution for chart
  const [userDist] = await db.query(`
    SELECT role, COUNT(*) as count FROM users GROUP BY role
  `);

  // Booking status distribution
  const [bookingDist] = await db.query(`
    SELECT status, COUNT(*) as count FROM resource_bookings GROUP BY status
  `);

  // Resource usage (most booked)
  const [resourceUsage] = await db.query(`
    SELECT r.resource_name, COUNT(rb.booking_id) as booking_count
    FROM resources r LEFT JOIN resource_bookings rb ON r.resource_id = rb.resource_id
    GROUP BY r.resource_id, r.resource_name HAVING booking_count > 0
    ORDER BY booking_count DESC LIMIT 10
  `);

  // Recent events
  const [recentEvents] = await db.query(`
    SELECT e.event_id, e.title, e.event_date, e.status, u.name as organizer_name
    FROM events e INNER JOIN users u ON e.organizer_id = u.user_id
    ORDER BY e.created_at DESC LIMIT 5
  `);

  res.json({
    stats: { ...userStats[0], ...eventStats[0], ...resourceStats[0], ...bookingStats[0], ...registrationStats[0] },
    charts: { eventsByCategory, regByMonth: regByMonth.reverse(), userDist, bookingDist, resourceUsage },
    recentEvents
  });
}

async function getFacultyDashboard(res, userId) {
  const [myEvents] = await db.query(`
    SELECT COUNT(*) as total_events,
           SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_events,
           SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved_events,
           SUM(CASE WHEN status='approved' AND event_date >= CURDATE() THEN 1 ELSE 0 END) as upcoming_events
    FROM events WHERE organizer_id = ?
  `, [userId]);

  const [myBookings] = await db.query(`
    SELECT COUNT(*) as total_bookings,
           SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending_bookings,
           SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as active_bookings
    FROM resource_bookings WHERE user_id = ?
  `, [userId]);

  const [upcomingEvents] = await db.query(`
    SELECT e.event_id, e.title, e.event_date, e.start_time, e.status,
           v.venue_name, ec.category_name,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled') as registered_count
    FROM events e
    LEFT JOIN venues v ON e.venue_id = v.venue_id
    LEFT JOIN event_categories ec ON e.category_id = ec.category_id
    WHERE e.organizer_id = ? AND e.event_date >= CURDATE()
    ORDER BY e.event_date ASC LIMIT 5
  `, [userId]);

  const [notifications] = await db.query(
    'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]
  );

  res.json({
    stats: { ...myEvents[0], ...myBookings[0], unread_notifications: notifications[0].unread },
    upcomingEvents
  });
}

async function getStudentDashboard(res, userId) {
  const [regStats] = await db.query(`
    SELECT COUNT(*) as registered_events,
           SUM(CASE WHEN e.event_date >= CURDATE() AND er.attendance_status = 'registered' THEN 1 ELSE 0 END) as upcoming_events
    FROM event_registrations er
    INNER JOIN events e ON er.event_id = e.event_id
    WHERE er.user_id = ? AND er.attendance_status != 'cancelled'
  `, [userId]);

  const [bookingStats] = await db.query(`
    SELECT COUNT(*) as total_bookings,
           SUM(CASE WHEN status IN ('pending','approved') THEN 1 ELSE 0 END) as active_bookings
    FROM resource_bookings WHERE user_id = ?
  `, [userId]);

  const [upcomingEvents] = await db.query(`
    SELECT e.event_id, e.title, e.event_date, e.start_time, e.end_time,
           v.venue_name, ec.category_name, er.attendance_status,
           (SELECT COUNT(*) FROM event_registrations r WHERE r.event_id = e.event_id AND r.attendance_status != 'cancelled') as registered_count,
           e.max_participants
    FROM event_registrations er
    INNER JOIN events e ON er.event_id = e.event_id
    LEFT JOIN venues v ON e.venue_id = v.venue_id
    LEFT JOIN event_categories ec ON e.category_id = ec.category_id
    WHERE er.user_id = ? AND e.event_date >= CURDATE() AND er.attendance_status = 'registered'
    ORDER BY e.event_date ASC LIMIT 5
  `, [userId]);

  const [availableEvents] = await db.query(`
    SELECT e.event_id, e.title, e.event_date, e.start_time, ec.category_name, v.venue_name,
           e.max_participants,
           (SELECT COUNT(*) FROM event_registrations er WHERE er.event_id = e.event_id AND er.attendance_status != 'cancelled') as registered_count
    FROM events e
    LEFT JOIN event_categories ec ON e.category_id = ec.category_id
    LEFT JOIN venues v ON e.venue_id = v.venue_id
    WHERE e.status = 'approved' AND e.event_date >= CURDATE()
      AND e.event_id NOT IN (SELECT event_id FROM event_registrations WHERE user_id = ? AND attendance_status != 'cancelled')
    ORDER BY e.event_date ASC LIMIT 5
  `, [userId]);

  const [notifications] = await db.query(
    'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE', [userId]
  );

  res.json({
    stats: { ...regStats[0], ...bookingStats[0], unread_notifications: notifications[0].unread },
    upcomingEvents,
    availableEvents
  });
}
